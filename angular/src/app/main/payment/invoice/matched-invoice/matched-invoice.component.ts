import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ImportAttachFileComponent } from '@app/shared/common/import-attach-file/import-attach-file.component';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { InvoiceHeadersDto, InvoiceServiceProxy, InvoicesServiceProxy, SearchInvoiceOutputDetailDto, SearchInvoiceOutputDto } from '@shared/service-proxies/service-proxies';
import { forEach, trim } from 'lodash-es';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';

@Component({
    selector: 'app-matched-invoice',
    templateUrl: './matched-invoice.component.html',
    styleUrls: ['./matched-invoice.component.less']
})
export class MatchedInvoiceComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @ViewChild("attach", { static: true }) attach: ImportAttachFileComponent;
    @Output() close = new EventEmitter<any>();
    @Output() modalSave = new EventEmitter<any>();
    gridParams: GridParams | undefined;
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    listItem: SearchInvoiceOutputDetailDto[] = [];
    selectedItem: SearchInvoiceOutputDetailDto = new SearchInvoiceOutputDetailDto();
    selectedNode;
    createOrEditForm: FormGroup;
    inputText2Value = "";
    inputText2 = "";
    isSubmit = false;
    selectedRow: SearchInvoiceOutputDto = new SearchInvoiceOutputDto();
    gridColDef: CustomColDef[];
    error;
    vendorList: any[] = [];
    currencyList: any[] = [];
    removeId = '';
    totalActual;
    changeData: { id: number, quantity: number, checkQty: boolean }[] = [];
    defaultColDef = {
        floatingFilter: true,
        filter: "agTextColumnFilter",
        resizable: true,
        sortable: true,
        isViewSideBar: false,
        floatingFilterComponentParams: { suppressFilterButton: true },
        textFormatter: function (r) {
            if (r == null) return null;
            return r.toLowerCase();
        },
    };
    constructor(
        injector: Injector,
        private _invoicesServiceProxy: InvoicesServiceProxy,
        private _api: InvoiceServiceProxy,
        private formBuilder: FormBuilder,
        private dataformat: DataFormatService
    ) {
        super(injector);
    }

    ngOnInit(): void {
        this.gridColDef = [
            {
                headerName: this.l("No."),
                headerTooltip: this.l("No."),
                cellRenderer: (params) => (this.paginationParams.pageNum - 1) * this.paginationParams.pageSize + params.rowIndex + 1,
                field: "stt",
                pinned: true,
                width: 45,
            },
            {
                headerName: this.l('PoNumber'),
                field: 'poNumber',
                sortable: true,
                width: 150,
            },
            {
                headerName: this.l('CreationDate'),
                field: 'invoiceDate',
                sortable: true,
                width: 120,
                cellRenderer: (params: ICellRendererParams) => {
                    return moment(params.value).format('DD/MM/YYYY');
                },
                cellClass: ['text-center'],
            },
            {
                headerName: this.l('ItemNumber'),
                field: 'itemNumber',
                sortable: true,
                width: 130,
            },
            {
                headerName: this.l('ItemDescription'),
                field: 'itemDescription',
                sortable: true,
                width: 145,
            },
            {
                headerName: this.l('Qty'),
                field: 'quantity',
                cellClass: ['text-right'],
                editable: true,
                sortable: true,
                width: 90,
                cellStyle: (param) => {
                    let quantity = this.changeData.find(x => x.id == param.data.itemId);
                    if (param.data?.quantity > quantity?.quantity) {
                        this.changeData.find(x => x.id == param.data.itemId).checkQty = true;
                        return { 'background-color': '#e65353' };
                    }
                    if (param.data?.quantity <= quantity?.quantity) {
                        this.changeData.find(x => x.id == param.data.itemId).checkQty = false;
                        return { 'background-color': '#87ec68' };
                    }
                },
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l('QtyPO'),
                field: 'quantityOrder',
                cellClass: ['text-right'],
                sortable: true,
                width: 100,
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l('QuantityGR'),
                field: 'quantityReceived',
                sortable: true,
                editable: true,
                cellClass: ['text-right'],
                width: 110,
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "0",
            },
            {
                headerName: this.l('QuantityPayment'),
                field: 'quantityMatched',
                sortable: true,
                editable: true,
                cellClass: ['text-right'],
                width: 110,
                cellStyle: (param) => {
                    if (Number(param.data?.quantityMatched) > param.data?.quantityReceived || Number(param.data?.quantityMatched) < 0) {
                        this.changeData.find(x => x.id == param.data.itemId).checkQty = true;
                        return { 'background-color': '#e65353' };
                    }
                    if (Number(param.data?.quantityMatched) <= param.data?.quantityReceived) {
                        this.changeData.find(x => x.id == param.data.itemId).checkQty = false;
                        return { 'background-color': '#87ec68' };
                    }
                },
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "0",
            },
            {
                headerName: this.l('QtyRemainGR'),
                field: 'qtyRemainGR',
                sortable: true,
                cellClass: ['text-right'],
                width: 110,
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "0",
                valueGetter: params => params.data ? (params.data.quantityReceived ?? 0) - (params.data.quantityMatched ?? 0) : 0,
                cellStyle: (param) => {
                    if (Number(param.data?.qtyRemainGR) < 0) {
                        this.changeData.find(x => x.id == param.data.itemId).checkQty = true;
                        return { 'background-color': '#e65353' };
                    }
                    if (Number(param.data?.qtyRemainGR) >= 0) {
                        this.changeData.find(x => x.id == param.data.itemId).checkQty = false;
                        return { 'background-color': '#87ec68' };
                    }
                },
            },
            {
                headerName: this.l('ForeginPrice'),
                field: 'foreignPrice',
                cellClass: ['text-right'],
                sortable: true,
                width: 130,
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l('Amount'),
                field: 'amount',
                valueGetter: params => params.data ? (params.data.foreignPrice ?? 0) * (params.data.quantity ?? 0) : 0,
                cellClass: ['text-right'],
                sortable: true,
                width: 130,
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l('TaxRate'),
                field: 'taxRate',
                cellClass: ['text-right'],
                editable: true,
                sortable: true,
                width: 90,
                cellStyle: (param) => {
                    if (param.data?.taxRate < 0 || param.data?.taxRate == null || param.data?.taxRate == undefined || param.data?.taxRate == "" || trim(param.data?.taxRate) == "") {
                        this.changeData.find(x => x.id == param.data.itemId).checkQty = true;
                        return { 'background-color': '#e65353' };
                    }
                    if (param.data?.taxRate >= 0) {
                        this.changeData.find(x => x.id == param.data.itemId).checkQty = false;
                        return { 'background-color': '#87ec68' };
                    }
                },
                onCellValueChanged: (params) => {
                    if (params.data?.taxRate < 0 || params.data?.taxRate == null || params.data?.taxRate == undefined || params.data?.taxRate == "" || trim(params.data?.taxRate) == "") {
                        this.notify.error('Tax Rate must be greater than or equal to 0');
                        params.data.taxRate = 0;
                    }
                }
            },
            {
                headerName: this.l('TotalTaxAmount'),
                field: 'amountVat',
                cellClass: ['text-right'],
                sortable: true,
                width: 130,
                valueGetter: params => params.data ? (params.data.amount ?? 0) * (params.data.taxRate ?? 0) : 0,
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "",
            },
        ]
    }


    show(params: any) {
        this.getCache();
        this.selectedRow = params ?? new SearchInvoiceOutputDto();
        this.totalActual = this.selectedRow.totalPaymentAmount;
        this.selectedRow.totalPaymentAmount = this.dataformat.moneyFormat(this.selectedRow.totalPaymentAmount) ?? 0 as any;
        this.spinnerService.show();
        this._api.getInvoiceSearchDetail(this.selectedRow.id, 'Not Matched')
            .pipe(finalize(() => {
                this.getCache();
            }))
            .subscribe(val => {
                this.listItem = val;
                forEach(this.listItem, (e) => {
                    this.changeData.push({ id: e.itemId, quantity: e.remainQty, checkQty: false });
                    this.removeId = this.listItem.map(e => e.itemId).join(',');
                })
                this.attach.setData(this.selectedRow.id, "Invoice");
            })
    }

    getCache() {
        let vendor = this._api.getAllVendor();
        let currency = this._api.getAllCurrency();
        this.currencyList = [];
        this.vendorList = [];
        forkJoin([vendor, currency]).pipe(finalize(() => {
            this.modal.show();
            this.spinnerService.hide();
        })).subscribe(res => {
            res[0].forEach(e => {
                this.vendorList.push({
                    label: e.supplierName,
                    value: e.id,
                    code: e.supplierNumber
                })
            })

            res[1].forEach(e => {
                this.currencyList.push({
                    label: e.code,
                    value: e.id,
                })
            })
        });
        this.currencyList = [...this.currencyList];
        this.vendorList = [...this.vendorList];
    }

    closeModel() {
        this.listItem = [];
        this.removeId = null;
        this.error = false;
        this.changeData = [];
        this.modal.hide();
    }

    reset() {
        this.createOrEditForm = undefined;
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listItem) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
        params.api.setRowData([]);
    }

    onChangeSelection(params) {
        this.selectedRow =
            params.api.getSelectedRows()[0] ?? new InvoiceHeadersDto();

        this.selectedRow = Object.assign({}, this.selectedRow);
    }

    save() {
        if (!this.checkValidate()) return;
        this.spinnerService.show();
        this.selectedRow.totalPaymentAmount = this.totalActual;
        this.selectedRow.invoiceDetailList = this.listItem;
        this.selectedRow.vendorName = this.vendorList.find(e => e.value == this.selectedRow?.vendorId)?.label;
        this.selectedRow.vendorNumber = this.vendorList.find(e => e.value == this.selectedRow?.vendorId)?.code;
        this.selectedRow.currencyCode = this.currencyList.find(e => e.value == this.selectedRow?.currencyId)?.label;
        this._api.matchedInvoice(this.selectedRow)
            .pipe(finalize(() => {
                if (this.error) {
                    this.spinnerService.hide();
                    return;
                }
                this.spinnerService.hide();
                this.closeModel();
                this.modalSave.emit(null);
            }))
            .subscribe(res => {
                if (res.includes('Error:') || res.includes('error:')) {
                    this.notify.error(res);
                    this.error = true;
                }
                else {
                    this.notify.success("Save success");
                    this.attach.saveAttachFile(res);
                }
            })
    }

    checkValidate() {
        if (!this.selectedRow.invoiceDate) {
            this.notify.warn("Invoice Date is required");
            return false
        }
        else if (!this.selectedRow.invoiceNum || this.selectedRow.invoiceNum.trim() == "") {
            this.notify.warn("Invoice num is required");
            return false
        }
        else if (!this.selectedRow.vendorId || this.selectedRow.vendorId == 0 || this.selectedRow.vendorId == -1) {
            this.notify.warn("Please choose vendor name");
            return false
        }
        else if (this.changeData.filter(e => e.checkQty == true).length > 0) {
            this.notify.warn("Please check Quantity Invoice or Tax rate");
            return false
        }
        return true;
    }

    onChangeDetailRow(params) {
        this.selectedItem =
            params.api.getSelectedRows()[0] ?? new SearchInvoiceOutputDetailDto();

        this.selectedItem = Object.assign({}, this.selectedItem);

        const selectedNode = params.api.getSelectedNodes()[0];
        if (selectedNode) this.selectedNode = selectedNode;
    }

    onCellValueChanged(params) {
        this.selectedRow.totalPaymentAmount = 0;
        forEach(this.listItem, e => {
            this.selectedRow.totalPaymentAmount += e.quantity * e.foreignPrice;
        })
        this.selectedRow.totalPaymentAmount = this.selectedRow.totalPaymentAmount + (this.selectedRow.totalPaymentAmount * this.selectedRow.taxRate / 100);
        this.totalActual = this.selectedRow.totalPaymentAmount;
        this.selectedRow.totalPaymentAmount = this.dataformat.moneyFormat(this.selectedRow.totalPaymentAmount) ?? '0.00' as any;
    }
}
