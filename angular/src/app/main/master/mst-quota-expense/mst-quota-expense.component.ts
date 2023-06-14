import { AppConsts } from './../../../../shared/AppConsts';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, Injector, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MstQuotaExpenseDto, MstQuotaExpenseServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as saveAs from 'file-saver';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditQuotaExpenseGroupComponent } from './create-or-edit-quota-expense/create-or-edit-quota-expense-group.component';
import { CreateOrEditQuotaExpenseComponent } from './create-or-edit-quota-expense/create-or-edit-quota-expense.component';
import * as FileSaver from 'file-saver';

@Component({
    selector: 'app-mst-quota-expense',
    templateUrl: './mst-quota-expense.component.html',
    styleUrls: ['./mst-quota-expense.component.less']
})
export class MstQuotaExpenseComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditMstQuoteExpense', { static: true }) createOrEditMstQuoteExpense: CreateOrEditQuotaExpenseComponent;
    @ViewChild('createOrEditMstQuoteExpenseGroup', { static: true }) createOrEditMstQuoteExpenseGroup: CreateOrEditQuotaExpenseGroupComponent;

    qoutaForm: FormGroup;
    qoutaFormGroup: FormGroup;
    gridColDef: CustomColDef[];
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    paginationGroupParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    listData: MstQuotaExpenseDto[];
    listDataGroup: MstQuotaExpenseDto[];
    selectedRow: MstQuotaExpenseDto = new MstQuotaExpenseDto();
    selectedRowGroup: MstQuotaExpenseDto = new MstQuotaExpenseDto();
    input//: InputSearchMstQuotaExpense = new InputSearchMstQuotaExpense();
    check = false;
    checkgroup = false;
    invNum;
    invSymbol;
    urlBase = AppConsts.remoteServiceBaseUrl;
    constructor(
        injector: Injector,
        private _mstQuotaExpenseServiceProxy: MstQuotaExpenseServiceProxy,
        private formBuilder: FormBuilder,
        private dataFormatService: DataFormatService,
        private _http: HttpClient,
        private _fileDownloadService: FileDownloadService


    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.buildForm();
        this.buildFormGroup();
        this.gridColDef = [
            {
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                maxWidth: 45,
                width: 45,
                cellClass: ['text-center'],

            },
            {
                headerName: this.l('QuotaCode'),
                headerTooltip: this.l('QuotaCode'),
                field: 'quotaCode',
                cellClass: ['text-left'],
                maxWidth: 400
            },
            {
                headerName: this.l('OrgName'),
                headerTooltip: this.l('OrgName'),
                field: 'orgName',
                width: 160,
                cellClass: ['text-left'],

            },
            {
                headerName: this.l('TitleName'),
                headerTooltip: this.l('TitleName'),
                field: 'titleName',
                width: 160,
                cellClass: ['text-left'],

            },
            {
                headerName: this.l('QuotaPrice'),
                headerTooltip: this.l('QuotaPrice'),
                field: 'quotaPrice',
                width: 100,
                cellClass: ['text-right'],
            },
            {
                headerName: this.l('UnitOfMeasure'),
                headerTooltip: this.l('UnitOfMeasure'),
                field: 'currencyName',
                width: 90,
                cellClass: ['text-left'],
            },
            {
                headerName: this.l('StartDate'),
                headerTooltip: this.l('StartDate'),
                field: 'startDate',
                valueGetter: (params) =>
                    params.data ? this.dataFormatService.dateFormat(params.data?.startDate) : '',
                width: 100,
                cellClass: ['text-center'],
            },
            {
                headerName: this.l('EndDate'),
                headerTooltip: this.l('EndDate'),
                field: 'endDate',
                valueGetter: (params) =>
                    params.data ? this.dataFormatService.dateFormat(params.data?.endDate) : '',
                width: 100,
                cellClass: ['text-center'],
            },
            {
                headerName: this.l('CreationDate'),
                headerTooltip: this.l('CreationDate'),
                field: 'creationDate',
                valueGetter: (params) =>
                    params.data ? this.dataFormatService.dateFormat(params.data?.creationDate) : '',
                width: 100,
                cellClass: ['text-center'],
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'status',
                cellRenderer: (params) => this.l(params.value),
                width: 90,
                cellClass: ['text-left'],
            },
        ]
    }

    buildForm() {
        this.qoutaForm = this.formBuilder.group({
            qoutaCode: [undefined],
        });
        this.search();
    }
    buildFormGroup() {
        this.qoutaFormGroup = this.formBuilder.group({
            qoutaCode: [undefined],
        });
        this.searchGroup();
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }
    callBackGridGroup(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }

    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new MstQuotaExpenseDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
        this.check = true;
    }
    onChangeSelectionGroup(params) {
        this.selectedRowGroup = params.api.getSelectedRows()[0] ?? new MstQuotaExpenseDto();
        this.selectedRowGroup = Object.assign({}, this.selectedRowGroup);
        this.checkgroup = true;
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listData) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.search();
    }

    changePaginationParamsGroup(paginationParams: PaginationParamsModel) {
        if (!this.listDataGroup) {
            return;
        }
        this.paginationGroupParams = paginationParams;
        this.paginationGroupParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationGroupParams.pageSize = paginationParams.pageSize;
        this.searchGroup();
    }

    search() {
        this.spinnerService.show();
        this._mstQuotaExpenseServiceProxy.getMstQuotaExpenseSearch(
            this.qoutaForm.value.qoutaCode,
            1,
            '',
            this.paginationParams ? this.paginationParams.pageSize : 5000,
            this.paginationParams ? this.paginationParams.skipCount : 0,
        )
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe((result) => {
                this.listData = result.items;
                // this.gridParams.api.setRowData(this.listData);
                this.paginationParams.totalCount = result.totalCount;
                this.paginationParams.totalPage = ceil(result.totalCount / this.paginationParams.pageSize);
                this.gridParams.api.sizeColumnsToFit();
            });
    }

    searchGroup() {
        this.spinnerService.show();
        this._mstQuotaExpenseServiceProxy.getMstQuotaExpenseSearch(
            this.qoutaFormGroup.value.qoutaCode,
            2,
            '',
            this.paginationGroupParams ? this.paginationGroupParams.pageSize : 5000,
            this.paginationGroupParams ? this.paginationGroupParams.skipCount : 0,
        )
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe((result) => {
                this.listDataGroup = result.items;
                // this.gridParams.api.setRowData(this.listDataGroup);
                this.paginationGroupParams.totalCount = result.totalCount;
                this.paginationGroupParams.totalPage = ceil(result.totalCount / this.paginationGroupParams.pageSize);
                this.gridParams.api.sizeColumnsToFit();
            });
    }

    export() {
        this.spinnerService.show();
        this._http.post(`${this.urlBase}/api/MasterExcelExport/MstQuotaExpenseExportExcel`,
            {
                quotaCode: this.qoutaForm.value.quotaCode,
                quoType: 1,
            },
            { responseType: 'blob' }).pipe(finalize(() => {
                this.spinnerService.hide();
            })).subscribe(blob => {
                FileSaver.saveAs(blob,'MstQuotaExpense.xlsx');
            });
    }

    exportGroup() {
        this.spinnerService.show();
        this._http.post(`${this.urlBase}/api/MasterExcelExport/MstQuotaExpenseExportExcel`,
            {
                quotaCode: this.qoutaForm.value.quotaCode,
                quoType: 2,
            },
            { responseType: 'blob' }).pipe(finalize(() => {
                this.spinnerService.hide();
            })).subscribe(blob => {
                FileSaver.saveAs(blob,'MstQuotaExpense.xlsx');
            });
    }
}
