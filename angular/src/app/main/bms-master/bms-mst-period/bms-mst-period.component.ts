import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { BmsMstPeriodDto, BmsMstPeriodServiceProxy, MstSupplierServiceProxy, SupplierOutputSelectDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { CreateOrEditBmsMstPeriodComponent } from './create-or-edit-bms-mst-period/create-or-edit-bms-mst-period.component';
import { BmsMstPeriodVersionComponent } from './bms-mst-period-version/bms-mst-period-version.component';
import { HttpClient } from '@angular/common/http';
import * as FileSaver from 'file-saver';

@Component({
  selector: 'app-bms-mst-period',
  templateUrl: './bms-mst-period.component.html',
  styleUrls: ['./bms-mst-period.component.less'],
})
export class BmsMstPeriodComponent extends AppComponentBase implements OnInit {
  @ViewChild('bmsMstPeriodVersion', { static: true }) bmsMstPeriodVersion: BmsMstPeriodVersionComponent;
  @ViewChild('createOrEditBmsMstPeriod', { static: true }) createOrEditBmsMstPeriod: CreateOrEditBmsMstPeriodComponent;
  periodForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = {
    pageNum: 1,
    pageSize: 20,
    totalCount: 0,
    totalPage: 0,
    sorting: '',
    skipCount: 0,
  };
  gridParams: GridParams | undefined;
  listPeriod: BmsMstPeriodDto[];
  selectedRow: BmsMstPeriodDto = new BmsMstPeriodDto();
  periodId: number = 0;
  periodName;
  _params;
  indexOfRowSelect;
  pagedSaleRowData;
  // defaultColDef: CustomColDef = {
  //     filter: false,
  //     sortable: false,
  //     suppressMenu: true,
  //     menuTabs: [],
  //     floatingFilter: true
  // };
  constructor(
    injector: Injector,
    private _bmsMstPeriodServiceProxy: BmsMstPeriodServiceProxy,
    private formBuilder: FormBuilder,
    private gridTableService: GridTableService,
    private dataFormatService: DataFormatService,
    private _http: HttpClient,
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
        cellRenderer: (params: ICellRendererParams) =>
          (
            (this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! +
            params.rowIndex +
            1
          ).toString(),
        maxWidth: 60,
      },
      {
        headerName: this.l('PeriodName'),
        headerTooltip: this.l('PeriodName'),
        field: 'periodName',
        maxWidth: 250
      },
      {
        headerName: this.l('PeriodYear'),
        field: 'periodYear',
        maxWidth: 150
      },
      {
        headerName: this.l('FromDate'),
        headerTooltip: this.l('FromDate'),
        field: 'fromDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.fromDate) : "",
        maxWidth: 120,
        cellClass: ["text-format-date-approvaltree"]
      },
      {
        headerName: this.l('Todate'),
        headerTooltip: this.l('Todate'),
        field: 'todate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.todate) : "",
        maxWidth: 120,
        cellClass: ["text-format-date-approvaltree "]
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description',
        maxWidth: 400,
      },
      {
        headerName: this.l('Status'),
        headerTooltip: this.l('Status'),
        field: 'isActive',
        cellRenderer: (params) => params.value ? this.l('Active') : this.l('InActive'),
        maxWidth: 100,
      },
    ];
  }

  buildForm() {
    this.periodForm = this.formBuilder.group({
      periodName: [undefined],
      periodYear: [undefined],
    });
    this.searchPeriod();
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  onChangeSelection(params) {
    this.selectedRow = params.api.getSelectedRows()[0] ?? new BmsMstPeriodDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
    this.periodId = this.selectedRow.id;
    this.periodName = this.selectedRow.periodName;
    this.bmsMstPeriodVersion.searchPeriodVersion(this.selectedRow.id);
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listPeriod) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.bmsMstPeriodVersion.searchPeriodVersion(0);
    this.searchPeriod();
  }

  searchPeriod() {
    this.spinnerService.show();
    this._bmsMstPeriodServiceProxy
      .getAllPeriod(
        this.periodForm.get('periodName').value,
        this.periodForm.get('periodYear').value,
        this.paginationParams ? this.paginationParams.sorting : '',
        this.paginationParams ? this.paginationParams.pageSize : 20,
        this.paginationParams ? this.paginationParams.skipCount : 1
      )
      .subscribe((result) => {
        this.listPeriod = result.items;
        this.gridParams.api.setRowData(this.listPeriod);
        this.paginationParams.totalCount = result.totalCount;
        this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
        this.spinnerService.hide();
      });
  }

  setTableVersion() {
    this.bmsMstPeriodVersion.searchPeriodVersion(0);
  }

  add() {
    this.createOrEditBmsMstPeriod.show();
  }

  edit() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.createOrEditBmsMstPeriod.show(this.selectedRow.id);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit));
    }
  }

  delete() {
    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._bmsMstPeriodServiceProxy.delete(this.selectedRow.id).subscribe(val => {
            this.notify.success('Successfully Deleted');
            this.searchPeriod();
            this.bmsMstPeriodVersion.searchPeriodVersion(0);
            this.spinnerService.hide();
          });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

  urlBase: string = AppConsts.remoteServiceBaseUrl;
  exportExcell() {
    this.spinnerService.show();
    this._http.post(`${this.urlBase}/api/MasterExcelExport/MstPeriodExportExcel`,
      {
        periodName: this.periodForm.get('periodName').value,
        periodYear: this.periodForm.get('periodYear').value,
        sorting: '',
        maxResultCount: 20,
        skipCount: 1
      },
      { responseType: 'blob' }).pipe(finalize(() => {
        this.spinnerService.hide();
      })).subscribe(blob => {
        FileSaver.saveAs(blob, 'BmsPeriod.xlsx');
      });
  }
}
