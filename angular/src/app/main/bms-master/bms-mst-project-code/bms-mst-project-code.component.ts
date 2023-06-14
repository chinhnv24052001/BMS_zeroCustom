import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodServiceProxy, BmsMstProjectCodeDto, BmsMstSegment1ServiceProxy, BmsMstSegment4GroupServiceProxy, ExchangeRateMasterServiceProxy, MstCurrencyServiceProxy, MstExchangeRateDto, MstPeriodServiceProxy, MstSegment1Dto, MstSegment4GroupDto, ProjectCodeServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { BmsImportSegmentComponent } from '../bms-import-segment/import-segment.component';
import { CreateOrEditBmsMstProjectCodeComponent } from './create-or-edit-bms-mst-project-code/create-or-edit-bms-mst-project-code.component';
import { CreateOrEditMultipleBmsMstProjectCodeComponent } from './create-or-edit-multiple-bms-mst-project-code/create-or-edit-multiple-bms-mst-project-code.component';

@Component({
  selector: 'app-bms-mst-project-code',
  templateUrl: './bms-mst-project-code.component.html',
  styleUrls: ['./bms-mst-project-code.component.css']
})
export class BmsMstProjectCodeComponent extends AppComponentBase implements OnInit {
  @ViewChild('createOrEditBmsMstProjectCode', { static: true })  createOrEditBmsMstProjectCode: CreateOrEditBmsMstProjectCodeComponent;
  @ViewChild('createOrEditMultipleBmsMstProjectCode', { static: true })  createOrEditMultipleBmsMstProjectCode: CreateOrEditMultipleBmsMstProjectCodeComponent;
  gridForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listGrid: BmsMstProjectCodeDto[];
  selectedRow: BmsMstProjectCodeDto = new BmsMstProjectCodeDto();
  listPertiod: { value:  number, label: string,  }[] = [];
  listCurrency: { value:  number, label: string,  }[] = [];
  urlBase: string = AppConsts.remoteServiceBaseUrl;

  constructor(
    injector: Injector,
    private _mainComponentServiceProxy: ProjectCodeServiceProxy,
    private _mstPeriodServiceProxy: BmsMstPeriodServiceProxy,
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
        minWidth: 200
      },
      {
        headerName: this.l('Version'),
        headerTooltip: this.l('Version'),
        field: 'periodVersionName', 
        minWidth: 100
      },
      {
        headerName: this.l('Segment1Name'),
        headerTooltip: this.l('Segment1Name'),
        field: 'segment1Name', 
        minWidth: 200
      },
      {
        headerName: this.l('Segment2Name'),
        headerTooltip: this.l('Segment2Name'),
        field: 'segment2Name', 
        minWidth: 200
      },
      {
        headerName: this.l('CodeProject'),
        headerTooltip: this.l('CodeProject'),
        field: 'codeProject',
        minWidth: 400
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
    this.gridForm = this.formBuilder.group({
      periodId: [0],
      fillterText: [undefined]
    });
    this.search();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new BmsMstProjectCodeDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }
  

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listGrid) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.search();
  }

  search() {
    this.spinnerService.show();
    this._mainComponentServiceProxy.getAllProjectCode(
      this.gridForm.get('fillterText').value,
      this.gridForm.get('periodId').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((result) => {
        this.listGrid = result.items;
        this.gridParams.api.setRowData(this.listGrid);
        this.paginationParams.totalCount = result.totalCount;
        this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
      });
  }

  add() {
    this.createOrEditBmsMstProjectCode.show();
  }

  edit() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditBmsMstProjectCode.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
    }
  }

  delete() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._mainComponentServiceProxy.delete(this.selectedRow.id).subscribe(val => {
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

  addMultiple()
  {
    this.createOrEditMultipleBmsMstProjectCode.show();
  }
}
