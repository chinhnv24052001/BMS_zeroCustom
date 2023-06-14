import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodServiceProxy, BmsMstSegment1ServiceProxy, BmsMstSegment3ServiceProxy, MstPeriodServiceProxy, MstSegment1Dto, MstSegment3Dto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditBmsMstSegment3Component } from './create-or-edit-bms-mst-segment3/create-or-edit-bms-mst-segment3.component';
import { BmsImportSegmentComponent } from '../bms-import-segment/import-segment.component';

@Component({
  selector: 'app-bms-mst-segment3',
  templateUrl: './bms-mst-segment3.component.html',
  styleUrls: ['./bms-mst-segment3.component.css']
})
export class BmsMstSegment3Component extends AppComponentBase implements OnInit {
  @ViewChild(' createOrEditBmsMstSegment3', { static: true })  createOrEditBmsMstSegment3: CreateOrEditBmsMstSegment3Component;
  @ViewChild('bmsImportSegment', { static: true }) bmsImportSegment: BmsImportSegmentComponent; 
  segment1Form: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listSegment3: MstSegment3Dto[];
  selectedRow: MstSegment3Dto = new MstSegment3Dto();
  listPertiod: { value:  number, label: string,  }[] = [];
  urlBase: string = AppConsts.remoteServiceBaseUrl;

  constructor(
    injector: Injector,
    private _bmsMstSegment3ServiceProxy: BmsMstSegment3ServiceProxy,
    private _mstPeriodServiceProxy: BmsMstPeriodServiceProxy,
    private _http: HttpClient,
    private formBuilder: FormBuilder,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.buildForm();
    this.selectDropDownPeriod();
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 70,
      },
      {
        headerName: this.l('Period'),
        headerTooltip: this.l('Period'),
        field: 'periodName', 
        maxWidth: 200
      },
      {
        headerName: this.l('Code'),
        headerTooltip: this.l('Code'),
        field: 'code',
        maxWidth: 200
      },
      {
        headerName: this.l('Name'),
        headerTooltip: this.l('Name'),
        field: 'name',
        maxWidth: 300
      },
      {
        headerName: this.l('Division'),
        headerTooltip: this.l('Division'),
        field: 'divisionName',
        maxWidth: 300
      },
      {
        headerName: this.l('Department'),
        headerTooltip: this.l('Department'),
        field: 'departmentName',
        maxWidth: 300
      },
      
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description',
        maxWidth: 400
      },
    ]
  }

  selectDropDownPeriod() {
    this._mstPeriodServiceProxy.getAllBmsPeriodNoPage('', 0, '', 20, 0 ).subscribe((result) => {
        this.listPertiod = [];
        this.listPertiod.push({ value: 0, label: " " });
        result.forEach(ele => {
            this.listPertiod.push({ value: ele.id, label: ele.periodName });
        });
    });
}

  buildForm() {
    this.segment1Form = this.formBuilder.group({
      periodId: [0],
      name: [undefined],
      code: [undefined]
    });
    this.search();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new MstSegment3Dto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listSegment3) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.search();
  }

  search() {
    this.spinnerService.show();
    this._bmsMstSegment3ServiceProxy.getAllSegment3(
      this.segment1Form.get('periodId').value,
      this.segment1Form.get('name').value,
      this.segment1Form.get('code').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((result) => {
        this.listSegment3 = result.items;
        this.gridParams.api.setRowData(this.listSegment3);
        this.paginationParams.totalCount = result.totalCount;
        this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
      });
  }

  add() {
    this.createOrEditBmsMstSegment3.show();
  }

  edit() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditBmsMstSegment3.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
    }
  }

  delete() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._bmsMstSegment3ServiceProxy.delete(this.selectedRow.id).subscribe(val => {
            this.notify.success('Successfully Deleted');
            this.search();
            this.spinnerService.hide();
          });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

   //Import excel
   importExcel() {
    this.bmsImportSegment.show(3);
}
}
