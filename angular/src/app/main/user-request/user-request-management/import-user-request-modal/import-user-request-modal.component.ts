import { CurrencyComboboxDto } from './../../../../../shared/service-proxies/service-proxies';
import { forEach } from 'lodash-es';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { ValueGetterParams, ValueFormatterParams } from '@ag-grid-enterprise/all-modules';
import { CreateUserRequestFromExcelInput, UrUserRequestManagementServiceProxy, UserRequestExcelDataDto } from '@shared/service-proxies/service-proxies';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, ElementRef, EventEmitter, Injector, Output, ViewChild } from '@angular/core';
import { CustomColDef, GridParams } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { HttpClient } from '@angular/common/http';
import { finalize } from 'rxjs/operators';
import { FileUpload } from 'primeng/fileupload';
import { FileDownloadService } from '@shared/utils/file-download.service';

@Component({
    selector: 'import-user-request-modal',
    templateUrl: './import-user-request-modal.component.html',
    styleUrls: ['./import-user-request-modal.component.less']
})
export class ImportUserRequestModalComponent extends AppComponentBase {
    @Output() modalSave: EventEmitter<any> = new EventEmitter();

    @ViewChild('importUserRequestModal') modal!: ModalDirective;
    @ViewChild('ExcelFileUpload', { static: false }) excelFileUpload: FileUpload;
    @ViewChild('imgInput', { static: false }) InputVar: ElementRef;

    productColDef: CustomColDef[] = [];
    defaultColDef = {
        suppressMenu: true
    };
    productsList: any[] = [];
    productParams: GridParams;
    selectedInfImport;

    uploadUrl: string = AppConsts.remoteServiceBaseUrl + '/UserImport/ImportUserRequestFromExcel';
    uploadData = [];
    fileName: string = '';
    formData: FormData = new FormData();
    processInfo: any[] = [];
    urlBase: string = AppConsts.remoteServiceBaseUrl;

    constructor(
        injector: Injector,
        private _http: HttpClient,
        private _serviceProxy: UrUserRequestManagementServiceProxy,
        private _fileDownloadService: FileDownloadService,
        private dataFormatService: DataFormatService
    ) {
        super(injector);
        this.productColDef = [
            {
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: params => params.rowIndex + 1,
                cellClass: ['text-center'],
                pinned: true,
                width: 50
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                cellClass: ['text-left'],
                valueGetter: params => params.data.exception ? params.data.exception : 'Thành công',
                cellStyle: (params) => {
                    if (params.data.exception) return { 'background-color': '#ff0000' };
                    else return { 'background-color': '#329932' };
                },
                pinned: true,
                width: 200
            },
            {
                headerName: this.l('InventoryGroup'),
                headerTooltip: this.l('InventoryGroup'),
                cellClass: ['text-left'],
                field: 'productGroupName',
                pinned: true,
                width: 110
            },
            {
                headerName: this.l('ProductCode'),
                headerTooltip: this.l('ProductCode'),
                cellClass: ['text-left'],
                field: 'productCodeColor',
                pinned: true,
                width: 110
            },
            {
                headerName: this.l('ProductName'),
                headerTooltip: this.l('ProductName'),
                cellClass: ['text-left'],
                field: 'productName',
                pinned: true,
                width: 180
            },
            {
                headerName: this.l('ProCurrencyCode'),
                headerTooltip: this.l('ProCurrencyCode'),
                field: 'uom',
                cellClass: ['text-center'],
                pinned: true,
                width: 70
            },
            {
                headerName: this.l('Price'),
                headerTooltip: this.l('Price'),
                cellClass: ['text-right'],
                field: 'unitPrice',
                pinned: true,
                valueFormatter: (params: ValueFormatterParams) => this.dataFormatService.moneyFormat(params.value),
                width: 80
            },
            {
                headerName: this.l('SupplierCode'),
                headerTooltip: this.l('SupplierCode'),
                cellClass: ['text-left'],
                field: 'vendorCode',
                width: 100
            },
            {
                headerName: this.l('SupplierName'),
                headerTooltip: this.l('SupplierName'),
                cellClass: ['text-left'],
                field: 'vendorName',
                width: 180
            },
            {
                headerName: this.l('SupplierSite'),
                headerTooltip: this.l('SupplierSite'),
                cellClass: ['text-left'],
                field: 'vendorSite',
                width: 120
            },
            {
                headerName: this.l('Delivery1'),
                headerTooltip: this.l('Delivery1'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery1) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery1),
                width: 80
            },
            {
                headerName: this.l('Delivery2'),
                headerTooltip: this.l('Delivery2'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery2) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery2),
                width: 80
            },
            {
                headerName: this.l('Delivery3'),
                headerTooltip: this.l('Delivery3'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery3) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery3),
                width: 80
            },
            {
                headerName: this.l('Delivery4'),
                headerTooltip: this.l('Delivery4'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery4) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery4),
                width: 80
            },
            {
                headerName: this.l('Delivery5'),
                headerTooltip: this.l('Delivery5'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery5) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery5),
                width: 80
            },
            {
                headerName: this.l('Delivery6'),
                headerTooltip: this.l('Delivery6'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery6) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery6),
                width: 80
            },
            {
                headerName: this.l('Delivery7'),
                headerTooltip: this.l('Delivery7'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery7) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery7),
                width: 80
            },
            {
                headerName: this.l('Delivery8'),
                headerTooltip: this.l('Delivery8'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery8) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery8),
                width: 80
            },
            {
                headerName: this.l('Delivery9'),
                headerTooltip: this.l('Delivery9'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery9) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery9),
                width: 80
            },
            {
                headerName: this.l('Delivery10'),
                headerTooltip: this.l('Delivery10'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery10) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery10),
                width: 80
            },
            {
                headerName: this.l('Delivery11'),
                headerTooltip: this.l('Delivery11'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery11) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery11),
                width: 80
            },
            {
                headerName: this.l('Delivery12'),
                headerTooltip: this.l('Delivery12'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery12) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery12),
                width: 80
            },
            {
                headerName: this.l('Delivery13'),
                headerTooltip: this.l('Delivery13'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery13) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery13),
                width: 80
            },
            {
                headerName: this.l('Delivery14'),
                headerTooltip: this.l('Delivery14'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery14) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery14),
                width: 80
            },
            {
                headerName: this.l('Delivery15'),
                headerTooltip: this.l('Delivery15'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery15) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery15),
                width: 80
            },
            {
                headerName: this.l('Delivery16'),
                headerTooltip: this.l('Delivery16'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery16) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery16),
                width: 80
            },
            {
                headerName: this.l('Delivery17'),
                headerTooltip: this.l('Delivery17'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery17) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery17),
                width: 80
            },
            {
                headerName: this.l('Delivery18'),
                headerTooltip: this.l('Delivery18'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery18) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery18),
                width: 80
            },
            {
                headerName: this.l('Delivery19'),
                headerTooltip: this.l('Delivery19'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery19) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery19),
                width: 80
            },
            {
                headerName: this.l('Delivery20'),
                headerTooltip: this.l('Delivery20'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery20) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery20),
                width: 80
            },
            {
                headerName: this.l('Delivery21'),
                headerTooltip: this.l('Delivery21'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery21) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery21),
                width: 80
            },
            {
                headerName: this.l('Delivery22'),
                headerTooltip: this.l('Delivery22'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery22) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery22),
                width: 80
            },
            {
                headerName: this.l('Delivery23'),
                headerTooltip: this.l('Delivery23'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery23) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery23),
                width: 80
            },
            {
                headerName: this.l('Delivery24'),
                headerTooltip: this.l('Delivery24'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery24) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery24),
                width: 80
            },
            {
                headerName: this.l('Delivery25'),
                headerTooltip: this.l('Delivery25'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery25) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery25),
                width: 80
            },
            {
                headerName: this.l('Delivery26'),
                headerTooltip: this.l('Delivery26'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery26) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery26),
                width: 80
            },
            {
                headerName: this.l('Delivery27'),
                headerTooltip: this.l('Delivery27'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery27) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery27),
                width: 80
            },
            {
                headerName: this.l('Delivery28'),
                headerTooltip: this.l('Delivery28'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery28) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery28),
                width: 80
            },
            {
                headerName: this.l('Delivery29'),
                headerTooltip: this.l('Delivery29'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery29) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery29),
                width: 80
            },
            {
                headerName: this.l('Delivery30'),
                headerTooltip: this.l('Delivery30'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.delivery30) : 0,
                cellStyle: (params) => this.deliveryCellStyle(params.data?.delivery30),
                width: 80
            },
            {
                headerName: this.l('MonthN'),
                headerTooltip: this.l('MonthN'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.monthN) : 0,
                width: 80
            },
            {
                headerName: this.l('MonthN1'),
                headerTooltip: this.l('MonthN1'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.monthN1) : 0,
                width: 80
            },
            {
                headerName: this.l('MonthN2'),
                headerTooltip: this.l('MonthN2'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.monthN2) : 0,
                width: 80
            },
            {
                headerName: this.l('MonthN3'),
                headerTooltip: this.l('MonthN3'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? this.dataFormatService.moneyFormat(params.data.monthN3) : 0,
                width: 80
            }
        ]
    }

    ngOnInit() {
    }

    callBackProductGrid(params: GridParams) {
        this.productParams = params;
    }

    show() {
        this.refresh();
        this.modal.show();
    }

    onUpload(data: { target: { files: Array<any> } }): void {
        if (data?.target?.files.length > 0) {
            this.formData = new FormData();
            const formData: FormData = new FormData();
            const file = data?.target?.files[0];
            this.fileName = file?.name;
            formData.append('file', file, file.name);
            this.formData = formData;
        }
    }

    upload() {
        this.spinnerService.show();
        this.uploadData = [];
        this.productParams.api?.setRowData([]);
        this.productsList = [];
        this.processInfo = [];
        this._http
            .post<any>(this.uploadUrl, this.formData)
            .pipe(finalize(() => {
                this.excelFileUpload?.clear();
                this.spinnerService.hide();
            }))
            .subscribe(response => {
                if (response.success && response.result.requests) {
                    this.uploadData = response.result.requests;
                    // this.productsList = this.handleDataImport(this.uploadData);
                    this.notify.success(this.l('SuccessfullyUpload'));
                } else if (response.error != null || !response.result.requests) {
                    this.notify.warn(this.l('DataIsInvalid'));
                }
                if (this.uploadData?.length < 1) return this.notify.warn(this.l('DataIsInvalid'));
                this.productParams.api.setRowData(this.handleDataImport(this.uploadData));
            });
    }

    reset() {
        setTimeout(() => {
            this.InputVar.nativeElement.value = "";
            this.fileName = '';
            this.InputVar.nativeElement.click();
            this.productParams.api?.setRowData([]);
            this.uploadData = [];
            this.productsList = [];
        }, 50);
    }

    refresh() {
        this.uploadData = [];
        this.productsList = [];
        this.fileName = '';
    }

    close() {
        this.modal.hide();
    }

    exportTemplate() {
        this.spinnerService.show();
        this._serviceProxy.exportUserRequestTempalte()
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => this._fileDownloadService.downloadTempFile(res))
    }

    request() {
        let warning: boolean = false;
        if (this.uploadData.findIndex(e => e.exception != null) != -1) {
            this.notify.warn(this.l('DataHasErrorPleaseCheckAgain'));
            return warning = true;
        };
        if (warning) return;
        else {
            this.spinnerService.show();
            let body = [];
            this.uploadData.forEach(e => {
                body.push({
                    inventoryGroupId: e.inventoryGroupId,
                    picDepartmentId: e.picDepartmentId,
                    picUserId: e.picUserId,
                    productId: e.productId,
                    productName: e.productName,
                    currencyId: e.currencyId,
                    currencyCode: e.currencyCode,
                    supplierId: e.supplierId,
                    unitPrice: e.unitPrice,
                    totalPrice: Number(e.unitPrice) * e.sumQty,
                    uom: e.uom,
                    monthN: e.monthN,
                    monthN1: e.monthN1,
                    monthN2: e.monthN2,
                    monthN3: e.monthN3,
                    deliveries: e.deliveries
                })
            });
            this._serviceProxy.createUserRequestFromExcel(body)
                .pipe(finalize(() => this.spinnerService.hide()))
                .subscribe(res => {
                    this.modal.hide();
                    this.modalSave.emit(null);
                    this.notify.success(this.l('SuccessfullyCreatedUr', res))
                })
        }
    }

    deliveryCellStyle(params: any) {
        // if (params && !Number(params)) return { 'background-color': '#ff0000' };
        return {};
    }

    handleDataImport(params: UserRequestExcelDataDto[]) {
        params.forEach(prod => {
            this.productsList.push(Object.assign({
                exception: prod.exception,
                productGroupName: prod.productGroupName,
                productCodeColor: prod.productCodeColor,
                productName: prod.productName,
                organizationCode: prod.organizationCode,
                // unitPrice: prod.unitPrice && prod.unitPrice.indexOf(',') != -1 ? prod.unitPrice.replace(',', '.') : prod.unitPrice,
                uom: prod.uom,
                unitPrice: prod.unitPrice,
                vendorCode: prod.vendorCode,
                vendorName: prod.vendorName,
                delivery1: prod.deliveries[0].quantity,
                delivery2: prod.deliveries[1].quantity,
                delivery3: prod.deliveries[2].quantity,
                delivery4: prod.deliveries[3].quantity,
                delivery5: prod.deliveries[4].quantity,
                delivery6: prod.deliveries[5].quantity,
                delivery7: prod.deliveries[6].quantity,
                delivery8: prod.deliveries[7].quantity,
                delivery9: prod.deliveries[8].quantity,
                delivery10: prod.deliveries[9].quantity,
                delivery11: prod.deliveries[10].quantity,
                delivery12: prod.deliveries[11].quantity,
                delivery13: prod.deliveries[12].quantity,
                delivery14: prod.deliveries[13].quantity,
                delivery15: prod.deliveries[14].quantity,
                delivery16: prod.deliveries[15].quantity,
                delivery17: prod.deliveries[16].quantity,
                delivery18: prod.deliveries[17].quantity,
                delivery19: prod.deliveries[18].quantity,
                delivery20: prod.deliveries[19].quantity,
                delivery21: prod.deliveries[20].quantity,
                delivery22: prod.deliveries[21].quantity,
                delivery23: prod.deliveries[22].quantity,
                delivery24: prod.deliveries[23].quantity,
                delivery25: prod.deliveries[24].quantity,
                delivery26: prod.deliveries[25].quantity,
                delivery27: prod.deliveries[26].quantity,
                delivery28: prod.deliveries[27].quantity,
                delivery29: prod.deliveries[28].quantity,
                delivery30: prod.deliveries[29].quantity,
                monthN1: prod.monthN1,
                monthN2: prod.monthN2,
                monthN3: prod.monthN3,
            }))
        });
        return this.productsList;
    }
}
