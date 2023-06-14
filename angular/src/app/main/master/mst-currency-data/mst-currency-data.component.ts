import { AppComponentBase } from 'shared/common/app-component-base';
import { Component, Injector, OnInit } from "@angular/core";
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { finalize } from 'rxjs/operators';
import { ceil } from 'lodash';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { MstGlExchangeRateServiceProxy, MstSupplierRequestServiceProxy, MstCurrencyServiceProxy, SearchOutputDto } from '@shared/service-proxies/service-proxies';
import * as moment from 'moment';
import { ICellRendererParams } from '@ag-grid-community/core';
import { AppConsts } from '@shared/AppConsts';
import { HttpClient } from '@angular/common/http';
import * as FileSaver from 'file-saver';

@Component({
    selector: "app-mst-currency-data",
    templateUrl: "./mst-currency-data.component.html",
    styleUrls: ["./mst-currency-data.component.scss"]
})

export class MstCurrencyDataComponent extends AppComponentBase implements OnInit {


    currencyValue = undefined;
    toCurrencyValue = undefined;
    currencyList: any[] = [];
    tabKey: number = 1;
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    selectedRow: SearchOutputDto = new SearchOutputDto();
    gridColDef: any[];

    requestTypeList: any[] = [];
    filterText = "";

    fromDate;
    toDate;
    urlBase: string = AppConsts.remoteServiceBaseUrl;

    rowData: any[] = [];
    constructor(injector: Injector,
        private dataFormatService: DataFormatService,
        private _http: HttpClient,
        private _serviceProxy: MstGlExchangeRateServiceProxy,
        private _curency: MstCurrencyServiceProxy) {
        super(injector);
        this.gridColDef = [
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => (params.rowIndex + 1).toString(),
                cellClass: ['text-center'],
                flex: 0.2,
            },
            {
                headerName: this.l('FromCurrency'),
                field: 'fromCurrency',
                flex: 1,
            },
            {
                headerName: this.l('ToCurrency'),
                field: 'toCurrency',
                flex: 1,
            },
            {
                headerName: this.l('ExchangeRate'),
                field: 'conversionRate',
                // valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.data.conversionRate) : "",
                cellClass: ['text-right'],
                flex: 1,
            },
            {
                headerName: this.l('EffectFromDate'),
                field: 'conversionDate',
                valueGetter: params => params.data ? this.dataFormatService.dateFormat(params.data.conversionDate) : "",
                cellClass: ['text-center'],
                flex: 1,
            },
        ]
    }



    ngOnInit() {
        this.currencyList = [];
        this._curency.loadAll(true)
            .pipe(finalize(() => {
                // this.searchData();
            }))
            .subscribe(res => {
                res.forEach(
                    e => {
                        this.currencyList.push({
                            label: e.currencyCode,
                            value: e.id,
                        })
                    }
                )
            })

    }

    getData() {

        return this._serviceProxy.getAllData(
            this.currencyValue,
            this.toCurrencyValue,
            this.fromDate,
            this.toDate,
            (this.paginationParams ? this.paginationParams.sorting : ''),
            (this.paginationParams ? this.paginationParams.pageSize : 20),
            (this.paginationParams ? this.paginationParams.skipCount : 1)
        )
    }

    searchData() {
        this.spinnerService.show();
        this.getData()
            .pipe(finalize(() => {
                this.spinnerService.hide();
                this.selectedRow = new SearchOutputDto();
            }))
            .subscribe(val => {
                this.rowData = val.items;
                this.gridParams.api.setRowData(this.rowData);
                this.paginationParams.totalCount = val.totalCount;
                this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);

                // this.gridParams.api.sizeColumnsToFit();
            })
    }

    onChangeSelection(params) {
        this.selectedRow =
            params.api.getSelectedRows()[0] ?? new SearchOutputDto();
        this.selectedRow = Object.assign({}, this.selectedRow);
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
    }

    deleteRow() {
        this.spinnerService.show();
        this._serviceProxy.delete(this.selectedRow.id)
            .pipe(finalize(() => {
                this.searchData()
                this.spinnerService.hide();
            }))
            .subscribe(res => {
                this.notify.success("Deleted Successfully")
            });
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.rowData) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.searchData();
    }

    exportExcell() {
        this.spinnerService.show();
        this._http.post(`${this.urlBase}/api/MasterExcelExport/MstGlExchangeRateExportExcel`,
            {
                currencyId: this.currencyValue,
                toCurrencyId: this.toCurrencyValue,
                startDate: this.fromDate,
                endDate: this.toDate,

            },
            { responseType: 'blob' }).pipe(finalize(() => {
                this.spinnerService.hide();
            })).subscribe(blob => {
                FileSaver.saveAs(blob, 'MstCurrency.xlsx');
            });
    }
}
