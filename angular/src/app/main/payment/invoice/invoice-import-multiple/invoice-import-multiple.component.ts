import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { GridParams } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { InvImportMultipleDto, InvoiceServiceProxy, SearchInvoiceOutputDetailDto, SearchInvoiceOutputDto } from '@shared/service-proxies/service-proxies';
import { forEach } from 'lodash-es';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-invoice-import-multiple',
    templateUrl: './invoice-import-multiple.component.html',
    styleUrls: ['./invoice-import-multiple.component.less']
})
export class InvoiceImportMultipleComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditModal', { static: true }) modal: ModalDirective;
    @ViewChild('submitBtn', { static: false }) submitBtn: ElementRef;
    @Output() close = new EventEmitter<any>();
    @Output() updateAfterEdit = new EventEmitter<any>();
    createOrEditForm: FormGroup;
    isEditForm: boolean = false;
    paginationParams = { pageNum: 1, pageSize: 5000, totalCount: 0 };
    isSubmit = false;
    listItems: SearchInvoiceOutputDetailDto[] = [];
    listHeader: SearchInvoiceOutputDto[] = [];
    listFilterItems: SearchInvoiceOutputDetailDto[] = [];
    inputInsert: InvImportMultipleDto = new InvImportMultipleDto();
    defaultColDef = {
        flex: false,
        floatingFilter: false,
        filter: 'agTextColumnFilter',
        resizable: true,
        sortable: true,
        floatingFilterComponentParams: { suppressFilterButton: true },
        textFormatter: function (r) {
            if (r == null) return null;
            return r.toLowerCase();
        },
    };
    listError;
    columnDef;
    contractColDef;
    fileName;
    uploadDataParams: GridParams;
    isSave = false;
    constructor(
        injector: Injector,
        private _serviceProxy: InvoiceServiceProxy,
        private formBuilder: FormBuilder,
        private _http: HttpClient,
        private dataFormatService: DataFormatService

    ) {
        super(injector);
        this.contractColDef = [
            {
                headerName: this.l("No."),
                headerTooltip: "No.",
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                field: "stt",
                pinned: true,
                width: 60,
            },
            {
                headerName: this.l("Error"),
                headerTooltip: this.l("Error"),
                field: "erroR_DESCRIPTION",
                width: 120,
                cellClass: ['text-center'],
                cellStyle: (params) => {
                    if (params.value != '') {
                        return { 'background-color': '#f77878' };
                    } else {
                        return '';
                    }
                }
            },
            {
                headerName: this.l('Inv.Symbol'),
                field: 'invoiceSymbol',
                sortable: true,
                width: 130,
            },
            {
                headerName: this.l('InvoiceNo'),
                field: 'invoiceNum',
                sortable: true,
                width: 150,
            },
            {
                headerName: this.l('Description'),
                field: 'description',
                cellClass: ['text-center'],
                sortable: true,
                width: 100,
            },
            {
                headerName: this.l('InvoiceDate'),
                field: 'invoiceDateStr',
                // valueGetter: params => params.data ? this.dataFormatService.dateFormat(params.data.invoiceDateStr) : "",
                sortable: true,
                cellClass: ['text-center'],
                width: 120,
            },
            {
                headerName: this.l('VendorName'),
                field: 'vendorName',
                sortable: true,
                width: 260,
            },
            {
                headerName: this.l('Currency'),
                field: 'currencyCode',
                cellClass: ['text-center'],
                sortable: true,
                width: 110,
            },
            {
                headerName: this.l('TotalAmount'),
                field: 'totalAmount',
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
                cellClass: ['text-right'],
                sortable: true,
                width: 100,
            },
            {
                headerName: this.l('TaxRate'),
                field: 'taxRateStr',
                sortable: true,
                cellClass: ['text-right'],
                width: 90,
            },
        ];
        this.columnDef = [
            {
                headerName: this.l("No."),
                headerTooltip: "No.",
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),

                field: "stt",
                pinned: true,
                width: 60,
            },
            {
                headerName: this.l("Error"),
                headerTooltip: this.l("Error"),
                field: "erroR_DESCRIPTION",
                width: 120,
                cellClass: ['text-left'],
                cellStyle: (params) => {
                    if (params.value != '') {
                        return { 'background-color': '#f77878' };
                    } else {
                        return '';
                    }
                }
            },
            {
                headerName: this.l('InvoiceNo'),
                field: 'invoiceNum',
                sortable: true,
                width: 150,
            },
            {
                headerName: this.l('PoNumber'),
                field: 'poNumber',
                sortable: true,
                cellClass: ['text-left'],
                width: 100,
            },
            {
                headerName: this.l('ItemNumber'),
                field: 'itemNumber',
                sortable: true,
                cellClass: ['text-left'],
                width: 100,

            },
            {
                headerName: this.l('ItemDescription'),
                field: 'itemDescription',
                sortable: true,
                cellClass: ['text-left'],
                width: 150,
            },
            {
                headerName: this.l('SL'),
                field: 'quantity',
                sortable: true,
                cellClass: ['text-right'],
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
                width: 80,
            },
            {
                headerName: this.l('SL PO'),
                field: 'quantityOrder',
                sortable: true,
                cellClass: ['text-right'],
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
                width: 80,
            },
            {
                headerName: this.l('QuantityGR'),
                field: 'quantityReceived',
                sortable: true,
                cellClass: ['text-right'],
                width: 110,
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l('QuantityPayment'),
                field: 'quantityMatched',
                sortable: true,
                cellClass: ['text-right'],
                width: 110,
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l('ForeignPriceInv'),
                field: 'foreignPrice',
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
                sortable: true,
                cellClass: ['text-right'],
                width: 100,
            },
            {
                headerName: this.l('Tax'),
                field: 'taxRate',
                sortable: true,
                cellClass: ['text-right'],
                width: 100,
            },
        ]
    }

    ngOnInit(): void {

    }

    buildForm() {
        this.createOrEditForm = this.formBuilder.group({
            fileName: [undefined],
        });
    }

    show() {
        this.isEditForm = false;
        this.refresh();
        this.buildForm();
        this.modal.show();
    }

    closeModel() {
        this.listHeader = [];
        this.listItems = [];
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    save() {
        this.inputInsert.listHeader = this.listHeader;
        if (this.isSave) {
            this.isSubmit = true;
            if (this.submitBtn) {
                this.submitBtn.nativeElement.click();
            }
            if (this.createOrEditForm.invalid) {
                return;
            }
            this.spinnerService.show();
            this._serviceProxy
                .invoiceInsertMultiple(this.inputInsert)
                .pipe(finalize(() => {
                    this.modal.hide();
                    this.close.emit();
                    this.spinnerService.hide();
                    this.updateAfterEdit.emit();
                }))
                .subscribe((val) => {
                    if (val.includes('Error:')) {
                        this.notify.error(val.replace('Error: ', ''));
                    }
                    else {
                        this.notify.success(val.replace('Info: ', ''));
                    }
                });
        } else {
            this.notify.error(this.l('DataHasErrorPleaseCheckAgain'));
        }
    }

    formData: any;
    uploadSubImage() {
        let input = document.createElement('input');
        input.type = 'file';
        input.className = 'd-none';
        input.id = 'imgInput';
        input.multiple = true;
        input.onchange = () => {
            let files = Array.from(input.files);
            this.onUpload(files);
        };
        input.click();
    }
    uploadData;
    onUpload(files: Array<any>): void {
        if (files.length > 0) {
            this.formData = new FormData();
            const formData: FormData = new FormData();
            const file = files[0];
            this.fileName = file?.name;
            formData.append('file', file, file.name);
            this.formData = formData;
        }
        this.createOrEditForm.get('fileName').setValue(this.fileName);
    }

    uploadUrl = `${AppConsts.remoteServiceBaseUrl}/InvoiceImport/ImportInvoiceMultipleFromExcel`;

    import() {
        this.isSave = true;
        this.spinnerService.show();
        this._http
            .post<any>(this.uploadUrl, this.formData)
            .pipe(finalize(() => {
                forEach(this.listHeader, (item) => {
                    if (item.erroR_DESCRIPTION != "") {
                        this.isSave = false;
                    }
                    this.listFilterItems = this.listItems.filter(x => x.invoiceNum == item.invoiceNum);
                    this.listFilterItems.forEach((i) => {
                        if (i.erroR_DESCRIPTION != "") {
                            this.isSave = false;
                        }
                        i.quantity = Number(i.quantityStr);
                        item.totalAmount = item.totalAmount + i.totalAmount;
                        item.totalAmountStr = this.dataFormatService.moneyFormat(item.totalAmount);
                    });
                });
                this.spinnerService.hide();
            }))
            .subscribe(response => {
                this.listHeader = response.result.invoiceData.listHeader;
                this.listItems = response.result.invoiceData.listItems;
                this.inputInsert = response.result.invoiceData;
            });
    }

    refresh() {
        this.listHeader = [];
        this.listItems = [];
        this.createOrEditForm?.get('fileName').setValue('');
    }

    callBackGrid(event) {
        this.uploadDataParams = event;
    }
}
