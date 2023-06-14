import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetPurchasePurposeDto, InputPurchasePurposeDto, MstPurchasePurposeServiceProxy, MstUnitOfMeasureServiceProxy, UnitOfMeasureDto } from '@shared/service-proxies/service-proxies';
import * as FileSaver from 'file-saver';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditMstUnitOfMeasureComponent } from './create-or-edit-mst-mst-unit-of-measure/create-or-edit-mst-unit-of-measure.component';

@Component({
  selector: 'app-mst-mst-unit-of-measure',
  templateUrl: './mst-mst-unit-of-measure.component.html',
  styleUrls: ['./mst-mst-unit-of-measure.component.css']
})
export class MstUnitOfMeasureComponent extends AppComponentBase implements OnInit {
  @ViewChild('createOrEditMstUnitOfMeasure', { static: true }) createOrEditMstUnitOfMeasure: CreateOrEditMstUnitOfMeasureComponent;
  unitOfMeasureForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listListUnitOfMeasure: UnitOfMeasureDto[];
  selectedRow: UnitOfMeasureDto = new UnitOfMeasureDto();
  urlBase: string = AppConsts.remoteServiceBaseUrl;

  constructor(
    injector: Injector,
    private _mstUnitOfMeasureServiceProxy: MstUnitOfMeasureServiceProxy,
    private _http: HttpClient,
    private formBuilder: FormBuilder,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.buildForm();
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 2,
      },
      {
        headerName: this.l('UOMCode'),
        headerTooltip: this.l('UOMCode'),
        field: 'uomCode'
      },
      {
        headerName: this.l('UnitOfMeasure'),
        headerTooltip: this.l('UnitOfMeasure'),
        field: 'unitOfMeasure'
      },
      {
        headerName: this.l('UOMClass'),
        headerTooltip: this.l('UOMClass'),
        field: 'uomClass'
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description'
      },
      {
        headerName: this.l('Status'),
        headerTooltip: this.l('Status'),
        field: 'status',
        cellRenderer: (params) => this.l(params.value),
        cellClass: ['text-center'],
        maxWidth: 120
      },
    ]
  }

  buildForm() {
    this.unitOfMeasureForm = this.formBuilder.group({
      unitOfMeasure: [undefined],
      uOMCode: [undefined],
      uOMClass: [undefined]
      // description: [undefined],
    });
    this.searchUnitOfMeasure();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new UnitOfMeasureDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listListUnitOfMeasure) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchUnitOfMeasure();
  }

  searchUnitOfMeasure() {
    this.spinnerService.show();
    this._mstUnitOfMeasureServiceProxy.getAllMeasureDto(this.unitOfMeasureForm.get('unitOfMeasure').value,
      this.unitOfMeasureForm.get('uOMCode').value,
      this.unitOfMeasureForm.get('uOMClass').value,
      // this.unitOfMeasureForm.get('description').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((result) => {
        this.listListUnitOfMeasure = result.items;
        this.gridParams.api.setRowData(this.listListUnitOfMeasure);
        this.paginationParams.totalCount = result.totalCount;
        this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
      });
  }

  addUnitOfMeasure() {
    this.createOrEditMstUnitOfMeasure.show();
  }

  editUnitOfMeasure() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditMstUnitOfMeasure.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
    }
  }


  deleteUnitOfMeasure() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._mstUnitOfMeasureServiceProxy.delete(this.selectedRow.id).subscribe(val => {
            this.notify.success('Successfully Deleted');
            this.searchUnitOfMeasure();
            this.spinnerService.hide();
          });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

  exportExcell() {
    this.spinnerService.show();
    this._http.post(`${this.urlBase}/api/MasterExcelExport/MstOUMExportExcel`,
      {
        UnitOfMeasure: this.unitOfMeasureForm.value.unitOfMeasure,
        UOMCode: this.unitOfMeasureForm.value.uOMCode,
        UOMClass: this.unitOfMeasureForm.value.uOMClass,

      },
      { responseType: 'blob' }).pipe(finalize(() => {
        this.spinnerService.hide();
      })).subscribe(blob => {
        FileSaver.saveAs(blob, 'MstOUMExportExcel.xlsx');
      });
  }

}
