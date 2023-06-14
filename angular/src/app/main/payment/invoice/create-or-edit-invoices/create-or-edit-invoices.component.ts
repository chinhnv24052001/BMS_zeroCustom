import { style } from '@angular/animations';
import { AppConsts } from './../../../../../shared/AppConsts';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { ICellRendererParams, ValueFormatterParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, ElementRef, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppComponentBase } from '@shared/common/app-component-base';
import { GetAllPoNumberByVendorDto, GetPoVendorDto, InvoiceHeadersDto, InvoiceServiceProxy, SearchInvoiceOutputDetailDto, SearchInvoiceOutputDto } from '@shared/service-proxies/service-proxies';
import { forEach, trim } from 'lodash-es';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { ImportAttachFileComponent } from '@app/shared/common/import-attach-file/import-attach-file.component';
import { ImportPoItemsComponent } from './import-po-items/import-po-items.component';
import { GridTableService } from '@app/shared/services/grid-table.service';

@Component({
    selector: 'create-or-edit-invoices',
    templateUrl: './create-or-edit-invoices.component.html',
    styleUrls: ['./create-or-edit-invoices.component.less']
})
export class CreateOrEditInvoicesComponent extends AppComponentBase implements OnInit {
    @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
    @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
    @ViewChild("poVendorModal") poVendorModal: TmssSelectGridModalComponent;
    @ViewChild("poVendorModalFromRow") poVendorModalFromRow: TmssSelectGridModalComponent;
    @ViewChild("updatePoMultiLines") updatePoMultiLines: TmssSelectGridModalComponent;
    @ViewChild("attach", { static: true }) attach: ImportAttachFileComponent;
    @ViewChild("importPO", { static: true }) importPO: ImportPoItemsComponent;
    @ViewChild('totalAmountInput', { static: true })  totalAmountInput!: ElementRef | any;
    @ViewChild('totalAmountTaxInput', { static: true })  totalAmountTaxInput!: ElementRef | any;

    @Output() modalClose = new EventEmitter<any>();
    @Output() modalSave = new EventEmitter<any>();
    gridParams: GridParams | undefined;
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    listItem: SearchInvoiceOutputDetailDto[] = [];
    selectedItem: SearchInvoiceOutputDetailDto = new SearchInvoiceOutputDetailDto();
    selectedNode;
    createOrEditForm: FormGroup;
    isEdit = true;
    inputText2Value = "";
    inputText2 = "";
    isSubmit = false;
    selectedRow: SearchInvoiceOutputDto = new SearchInvoiceOutputDto();
    gridColDef: CustomColDef[];
    poColDef: CustomColDef[];
    updatePoColDef: CustomColDef[] = [];
    error;
    vendorList: any[] = [];
    currencyList: any[] = [];
    removeId = '';
    totalActual;
    totalTaxActual;
    totalPOActual;
    checkPaid;
    param;
    listExport: GetPoVendorDto[] = [];
    changeData: { id: number, quantity: number, checkQty: boolean }[] = [];
    poNumbers: GetAllPoNumberByVendorDto[] = [];
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
    invalidInvNum = false;
    invalidVendor = false;
    invalidDate = false;

    totalAmountPo: number = 0;
    totalAmountActual: number = 0;
    totalTaxAmountPo: number = 0;
    totalTaxAmountActual: number = 0;
    highlight: any;
    isFocusoutAmount: boolean = false;
    isFocusoutTax: boolean = false;

    totalAmount: number = 0;
    totalTaxAmount: number = 0;

    constructor(
        injector: Injector,
        private _api: InvoiceServiceProxy,
        private dataformat: DataFormatService,
        private gridTableService: GridTableService
    ) {
        super(injector);

        this.gridColDef = [
            {
                headerName: '',
                headerTooltip: '',
                field: 'checked',
                checkboxSelection: true,
                cellClass: ['text-center', 'check-box-center'],
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                width: 50
            },
            {
                headerName: this.l("No."),
                headerTooltip: this.l("No."),
                cellRenderer: (params) => (this.paginationParams.pageNum - 1) * this.paginationParams.pageSize + params.rowIndex + 1,
                field: "stt",
                width: 50
            },
            {
                headerName: this.l('PoNumber'),
                field: 'poNumber',
                sortable: true,
                editable: true,
                width: 90
            },
            {
                headerName: this.l('ItemNumber'),
                field: 'itemNumber',
                sortable: true,
                width: 130
            },
            {
                headerName: this.l('ItemDescription'),
                field: 'itemDescription',
                sortable: true,
                width: 250
            },
            {
                headerName: this.l('Qty'),
                field: 'quantity',
                cellClass: ['text-right'],
                editable: true,
                sortable: true,
                width: 120,
                cellStyle: (param) => {
                    if (param.data?.quantity > (param.data.quantityGR ?? 0) - (param.data.quantityPayment ?? 0) && param.data?.status != AppConsts.CPS_KEYS.STATUS_MATHCHED) {
                        return { 'background-color': '#e65353' };
                    }
                    else {
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
                width: 120,
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l('QuantityGR'),
                field: 'quantityGR',
                sortable: true,
                cellClass: ['text-right'],
                width: 120,
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "0",
            },
            {
                headerName: this.l('QuantityPayment'),
                field: 'quantityPayment',
                sortable: true,
                cellClass: ['text-right'],
                width: 140,
                valueFormatter: params => params.data?.quantityPayment ? this.dataformat.moneyFormat(params.value) : "0",
            },
            {
                headerName: this.l('QtyRemainGR'),
                sortable: true,
                cellClass: ['text-right'],
                width: 120,
                valueGetter: params => params.data ? (params.data.quantityGR ?? 0) - (params.data.quantityPayment ?? 0) : 0,
            },
            {
                headerName: this.l('UnitPriceActual'),
                field: 'foreignPrice',
                cellClass: ['text-right'],
                sortable: true,
                editable: true,
                width: 130,
                cellStyle: (param) => {
                    if (!param.data?.foreignPrice || param.data?.foreignPrice < 0 || param.data?.foreignPrice == null || param.data?.foreignPrice == undefined || trim(param.data?.foreignPrice) == ""
                    || param.data?.foreignPrice != param.data?.unitPricePO && param.data?.status != AppConsts.CPS_KEYS.STATUS_MATHCHED) {
                        return { 'background-color': '#e65353' };
                    }
                    if (param.data?.foreignPrice >= 0) {
                        return { 'background-color': '#87ec68' };
                    }
                },
                onCellValueChanged: (params) => {
                    if (params.data?.foreignPrice < 0 || params.data?.foreignPrice == null || params.data?.foreignPrice == undefined || trim(params.data?.foreignPrice) == "") {
                        this.notify.error(this.l('DateInvalid', this.l('UnitPriceActual'), 0));
                        params.data.taxRate = 0;
                    }
                },
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l('UnitPricePO'),
                field: 'unitPricePO',
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
                width: 100,
                cellStyle: (param) => {
                    if (param.data?.taxRate < 0 || param.data?.taxRate == null || param.data?.taxRate == undefined || trim(param.data?.taxRate) == "") {
                        return { 'background-color': '#e65353' };
                    }
                    if (param.data?.taxRate >= 0) {
                        return { 'background-color': '#87ec68' };
                    }
                },
                onCellValueChanged: (params) => {
                    if (params.data?.taxRate < 0 || params.data?.taxRate == null || params.data?.taxRate == undefined || trim(params.data?.taxRate) == "") {
                        this.notify.error(this.l('DateInvalid', this.l('TaxRate'), 0));
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
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l('Note'),
                field: 'note',
                cellClass: ['text-left'],
                sortable: true,
                editable: true,
                width: 200,
            },
        ];

        this.poColDef = [
            {
                headerName: '',
                headerTooltip: '',
                field: 'checked',
                checkboxSelection: true,
                cellClass: ['text-left', 'check-box-center'],
                headerCheckboxSelection: true,
                headerCheckboxSelectionFilteredOnly: true,
                flex: 0.5
            },
            {
                headerName: this.l('PoNumber'),
                field: 'poNumber',
                sortable: true,
                width: 150,
            },
            {
                headerName: this.l('PartNo'),
                field: 'partNo',
                sortable: true,
                width: 150,
            },
            {
                headerName: this.l('CreationDate'),
                field: 'creationTime',
                sortable: true,
                width: 150,
                valueGetter: (params) =>
                    params.data ? this.dataformat.dateFormat(params.data?.creationTime) : '',
            },
            {
                headerName: this.l('Comments'),
                field: 'comments',
                sortable: true,
                width: 150,
            },
            {
                headerName: this.l('VendorName'),
                field: 'supplierName',
                sortable: true,
                width: 150,
            },
            {
                headerName: this.l('QtyPO'),
                field: 'quantityOrder',
                sortable: true,
                width: 150,
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "",

            },
            {
                headerName: this.l('QuantityPayment'),
                field: 'quantity',
                sortable: true,
                width: 150,
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "",

            },
            {
                headerName: this.l('QuantityGR'),
                field: 'quantityReceived',
                cellClass: ['text-right'],
                width: 110,
                valueFormatter: params => params.data ? this.dataformat.moneyFormat(params.value) : "0",
            },
            {
                headerName: this.l('Price'),
                field: 'unitPrice',
                sortable: true,
                valueFormatter: (params: ValueFormatterParams) => dataformat.moneyFormat(params.value),
                width: 150,

            },
            {
                headerName: this.l('Currency'),
                field: 'currencyCode',
                sortable: true,
                width: 150,
            },
        ];

        this.updatePoColDef = [
            {
                headerName: this.l('PoNumber'),
                headerTooltip: this.l('PoNumber'),
                field: 'poNumber',
                flex: 0.6
            },
            {
                headerName: this.l('Description'),
                headerTooltip: this.l('Description'),
                field: 'description',
                flex: 1.4
            },
        ];
    }

    ngOnInit(): void {
    }

    // cellEditingStop(params) {
    //     const col = params.colDef.field;
    //     // const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    //     switch (col) {
    //         case 'poNumber':
    //             if (!params.data[col] || (params.data[col] && params.data[col].trim() == "")) {
    //                 this.poVendorModalFromRow.show()
    //             }
    //             break;
    //     }
    // }

    show(params?: any) {
        this.spinnerService.show();
        this.getCache();
        this.selectedRow = params ?? new SearchInvoiceOutputDto();
        this.isEdit = true;
        if (!params) {
            this.listItem = [];
            this.selectedRow.taxName = 'VAT10';
            this.selectedRow.taxRate = 10;
            this.selectedRow.currencyId = 7;
            this.checkPaid = false;
            this.attach.uploadData = [];
            this.totalAmountPo = 0;
            this.totalAmountActual = 0;
            this.totalTaxAmountPo = 0;
            this.totalTaxAmountActual = 0;
        }
        else {
            this.checkPaid = this.selectedRow.isPaid;
            this._api.getInvoiceSearchDetail(this.selectedRow.id, '-1')
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                }))
                .subscribe(val => {
                    this.listItem = val;
                    val.map(e => {
                        this.removeId = this.listItem.map(e => e.itemId).join(',');
                    });
                    this.attach.setData(this.selectedRow.id, "Invoice");
                    this.caculateAmount();
                })
        }
    }

    view(params: any) {
        this.getCache();
        this.isEdit = false;
        this.selectedRow = params ?? new SearchInvoiceOutputDto();
        this.totalActual = this.selectedRow.totalPaymentAmount;
        this.totalPOActual = this.selectedRow.invoiceAmountPO;
        this.selectedRow.totalPaymentAmount = this.dataformat.moneyFormat(this.selectedRow.totalPaymentAmount) ?? 0 as any;
        this.selectedRow.invoiceAmountPO = this.dataformat.moneyFormat(this.selectedRow.invoiceAmountPO) ?? 0 as any;
        this.spinnerService.show();
        this.checkPaid = this.selectedRow.isPaid;
        this._api.getInvoiceSearchDetail(this.selectedRow.id, '-1')
            .pipe(finalize(() => {
                this.getCache();
            }))
            .subscribe(val => {
                this.listItem = val;
                forEach(this.listItem, (e) => {
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
        if (!this.selectedRow.id) {
            this.selectedRow = new SearchInvoiceOutputDto();
            this.listItem = [];
            this.removeId = null;
            this.error = false;
        }
        this.modal.hide();
        this.modalClose.emit(null);
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

    appendInvoices() {
        if (!this.selectedRow.vendorId) return this.notify.warn(this.l('ChoosePlease', this.l('VendorName')));
        this.poVendorModal.show();
    }

    getPoVendor() {
        return this._api.getPoVendorById(this.selectedRow.vendorId, this.removeId)
    }

    getParamExport() {
        if (!this.selectedRow.id && this.selectedRow.vendorId) {
            this.listItem = [];
            let vendorId = this.selectedRow.vendorId;
            this.selectedRow = new SearchInvoiceOutputDto();
            this.selectedRow.vendorId = vendorId;
            this.selectedRow.taxName = 'VAT10';
            this.selectedRow.taxRate = 10;
            this.selectedRow.currencyId = 7;
            this.selectedRow.totalAmount = 0;
            this.selectedRow.totalTaxAmount = 0;
            this.checkPaid = false;
            this.attach.uploadData = [];
            this.totalAmountPo = 0;
            this.totalAmountActual = 0;
            this.totalTaxAmountPo = 0;
            this.totalTaxAmountActual = 0;
            this.gridParams.api?.setRowData(this.listItem);
        }

        this._api.getPoVendorById(this.selectedRow.vendorId, this.removeId).subscribe
            (res => {
                res.forEach(e => {
                    this.listExport.push(
                        Object.assign(new GetPoVendorDto(), e)
                    )
                })
            });
    }

    setDataForGrid(params) {
        let listPo = [];
        if (!Array.isArray(params)) {
            listPo.push(params);
        }
        else {
            listPo = params;
        }
        listPo.forEach(e => {
            const newRow = Object.assign(new SearchInvoiceOutputDetailDto(), e);
            newRow.taxRate = this.selectedRow.taxRate;
            newRow.foreignPrice = e.invoicePrice ?? e.unitPrice;
            newRow.unitPricePO = e.unitPrice != null ?? e.unitPrice != undefined ? e.unitPrice : 0;
            newRow.amountVat = e.unitPrice * e.quantity * e.taxRate;
            newRow.quantityGR = e.quantityReceived ?? 0;
            newRow.taxRate = this.selectedRow.taxRate;
            newRow.isSkipInvCheck = e.isSkipInvCheck ?? false;
            this.gridParams.api.applyTransaction({ add: [newRow] });
            this.listItem.push(newRow);
            this.selectedRow.vendorId = e.vendorId;
            this.removeId = this.removeId + ',' + e.poHeaderId + e.itemDescription?.replace(/ /g, '')?.replace(/,/g, '');
            this.onCellValueChanged({ data: newRow });
        });
        this.caculateAmount();
    }

    setDataForRow(params) {
        this.selectedNode.data = Object.assign(this.selectedNode.data, params);
        this.selectedNode.data.taxRate = this.selectedRow.taxRate;
        this.selectedNode.data.foreignPrice = params.unitPrice != null ?? params.unitPrice != undefined ? params.unitPrice : 0;
        this.selectedNode.data.unitPricePO = params.unitPrice != null ?? params.unitPrice != undefined ? params.unitPrice : 0;
        this.selectedNode.data.isSkipInvCheck = params.isSkipInvCheck ?? false;
        this.gridParams.api.applyTransaction({ update: [this.selectedNode.data] });
    }

    onChangeDetailRow(params) {
        this.selectedItem =
            params.api.getSelectedRows()[0] ?? new SearchInvoiceOutputDetailDto();

        this.selectedItem = Object.assign({}, this.selectedItem);

        const selectedNode = params.api.getSelectedNodes()[0];
        if (selectedNode) this.selectedNode = selectedNode;
    }

    deleteRow() {
        let selectedRows = this.gridParams.api?.getSelectedRows();
        selectedRows.forEach(row => {
            this.gridParams?.api.applyTransaction({ remove: [row] });
            this.listItem = this.gridTableService.getAllData(this.gridParams);
            this.removeId = this.listItem.map(e => e.itemId).join(',');
        })

        this.caculateAmount();
    }

    caculateAmount() {
        let totalAmountPo = 0;
        let totalAmountActual = 0;
        let totalTaxAmountPo = 0;
        let totalTaxAmountActual = 0;

        this.listItem.forEach(e => {
            totalAmountPo += e.unitPricePO * e.quantity + Math.round(e.unitPricePO * e.quantity * ((e.taxRate ?? this.selectedRow.taxRate) / 100));
            totalAmountActual += e.foreignPrice * e.quantity + Math.round(e.foreignPrice * e.quantity * ((e.taxRate ?? this.selectedRow.taxRate) / 100));
            totalTaxAmountPo += Math.round(e.unitPricePO * e.quantity * ((e.taxRate ?? this.selectedRow.taxRate) / 100));
            totalTaxAmountActual += Math.round(e.foreignPrice * e.quantity * (e.taxRate / 100));
            e.amountVat = Math.round(e.foreignPrice * e.quantity * (e.taxRate / 100));
        });
        this.gridParams.api?.setRowData(this.listItem);
        this.totalAmountPo = totalAmountPo;
        this.selectedRow.totalAmount = this.selectedRow.source == AppConsts.CPS_KEYS.INV_SRC_AUTOMATIC ? this.selectedRow.totalAmount : totalAmountActual;
        this.totalTaxAmountPo = totalTaxAmountPo;
        this.selectedRow.totalTaxAmount = this.selectedRow.source == AppConsts.CPS_KEYS.INV_SRC_AUTOMATIC ? this.selectedRow.totalTaxAmount : totalTaxAmountActual;
        this.changeActualTotalAmount(this.selectedRow.totalAmount);
        this.changeTotalTaxActualAmount(this.selectedRow.totalTaxAmount);
    }

    setLoading(params) {
        if (params) this.spinnerService.show();
        this.spinnerService.hide();
    }

    onCellValueChanged(params) {
        if (params?.column?.colId == 'poNumber') {
            Object.assign(params.data, {
                quantityOrder: 0,
                quantityGR: 0,
                quantityPayment: 0,
                unitPricePO: 0
            });
            this.gridParams.api?.redrawRows();
        }
        // this.selectedRow.totalPaymentAmount = 0;
        // this.selectedRow.invoiceAmountPO = 0;
        // forEach(this.listItem, e => {
        //     this.selectedRow.totalPaymentAmount += e.quantity * e.foreignPrice;
        //     this.selectedRow.invoiceAmountPO += e.quantity * e.unitPricePO;
        // })
        // this.selectedRow.totalPaymentAmount = this.selectedRow.totalPaymentAmount + (this.selectedRow.totalPaymentAmount * this.selectedRow.taxRate);
        // this.selectedRow.invoiceAmountPO = this.selectedRow.invoiceAmountPO + (this.selectedRow.invoiceAmountPO * this.selectedRow.taxRate);
        // this.totalActual = this.selectedRow.totalPaymentAmount;
        // this.totalPOActual = this.selectedRow.invoiceAmountPO;
        // this.selectedRow.totalPaymentAmount = this.dataformat.moneyFormat(this.selectedRow.totalPaymentAmount) ?? '0.00' as any;
        // this.selectedRow.invoiceAmountPO = this.dataformat.moneyFormat(this.selectedRow.invoiceAmountPO) ?? '0.00' as any;
        this.caculateAmount();
    }

    import() {
        this.listItem = [];
        this.importPO.show();
    }

    checkValidate() {
        if (!this.selectedRow.invoiceNum || this.selectedRow.invoiceNum.trim() == "") {
            this.invalidInvNum = true;
            return false;
        } else {
            this.invalidInvNum = false;
        }
        if (!this.selectedRow.vendorId || this.selectedRow.vendorId == 0 || this.selectedRow.vendorId == -1) {
            this.invalidVendor = true;
            return false;
        }
        else {
            this.invalidVendor = false;
        }
        if (!this.selectedRow.invoiceDate) {
            this.invalidDate = true;
            return false;
        } else {
            this.invalidDate = false;
        }
        if (this.listItem.filter(e => e.vendorId != this.selectedRow.vendorId).length > 0 && !this.selectedRow.id) {
            this.notify.warn(this.l('NotMatch', this.l('VendorName')));
            return false;
        }
        return true;
    }

    save() {
        if (!this.checkValidate()) return;
        this.spinnerService.show();
        this.selectedRow.totalPaymentAmount = this.totalActual;
        this.selectedRow.invoiceAmountPO = this.totalPOActual;
        this.selectedRow.invoiceDetailList = [];

        if (this.listItem.filter(e => e.quantity > (e.quantityGR ?? 0) - (e.quantityPayment ?? 0) && e.status != AppConsts.CPS_KEYS.STATUS_MATHCHED).length > 0) {
            this.selectedRow.status = AppConsts.CPS_KEYS.STATUS_NOT_MATHCHED;
        }
        else if (this.listItem.filter(e => (!e.foreignPrice || e.foreignPrice < 0 || e.foreignPrice != e.unitPricePO)
            && e.status != AppConsts.CPS_KEYS.STATUS_MATHCHED && !e.isSkipInvCheck).length > 0) {
            this.selectedRow.status = AppConsts.CPS_KEYS.STATUS_NOT_MATHCHED;
        }
        else if (this.listItem.filter(e => (e.taxRate < 0 || e.taxRate == null || e.taxRate == undefined) && e.status != AppConsts.CPS_KEYS.STATUS_MATHCHED).length > 0) {
            this.selectedRow.status = AppConsts.CPS_KEYS.STATUS_NOT_MATHCHED;
        }
        else {
            this.selectedRow.status = AppConsts.CPS_KEYS.STATUS_MATHCHED;
        }

        this.listItem.forEach(e => {
            if (e.quantity > (e.quantityGR ?? 0) - (e.quantityPayment ?? 0) && e.status != AppConsts.CPS_KEYS.STATUS_MATHCHED) {
                e.status = AppConsts.CPS_KEYS.STATUS_NOT_MATHCHED;
            }
            else if ((!e.foreignPrice || e.foreignPrice < 0 || e.foreignPrice != e.unitPricePO) && e.status != AppConsts.CPS_KEYS.STATUS_MATHCHED && !e.isSkipInvCheck) {
                e.status = AppConsts.CPS_KEYS.STATUS_NOT_MATHCHED;
            }
            else if (e.taxRate < 0 || e.taxRate == null || e.taxRate == undefined && e.status != AppConsts.CPS_KEYS.STATUS_MATHCHED) {
                e.status = AppConsts.CPS_KEYS.STATUS_NOT_MATHCHED;
            }
            else {
                e.status = AppConsts.CPS_KEYS.STATUS_MATHCHED;
            }
        });

        if (!this.selectedRow.id) {
            this.selectedRow.source = AppConsts.CPS_KEYS.INV_SRC_MANUAL;
        }

        this.selectedRow.invoiceDetailList = this.listItem;
        this.selectedRow.vendorName = this.vendorList.find(e => e.value == this.selectedRow?.vendorId)?.label;
        this.selectedRow.vendorNumber = this.vendorList.find(e => e.value == this.selectedRow?.vendorId)?.code;
        this.selectedRow.currencyCode = this.currencyList.find(e => e.value == this.selectedRow?.currencyId)?.label;
        this.selectedRow.totalAmount = this.totalAmount;
        this.selectedRow.vatAmount = this.totalTaxActual;
        this._api.saveInvoice(this.selectedRow)
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

    updatePo(params: any) {
        if (!this.selectedRow?.vendorId) {
            this.notify.warn(this.l('ChoosePlease', this.l('VendorName')));
            return;
        }
        else {
            this.spinnerService.show();
            this.poNumbers = [];
            this._api.getAllPoNumberByVendor(this.selectedRow.vendorId)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                    this.updatePoMultiLines.show(this.poNumbers);
                }))
                .subscribe(res => {
                    this.poNumbers = res;
                });
        }
    }

    updatePoMultiLinesFunc(params: any) {
        let poLines = [];
        this.spinnerService.show();
        this._api.getAllPoLinesForUpdateInvoice(params.id)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => {
                poLines = res;
                if (poLines.length > 0) {
                    poLines.forEach(e => {
                        this.listItem.forEach(line => {
                            if (!line.poNumber && (line.itemDescription == e.partNameSupplier || line.itemDescription == e.partName)) {
                                line.poNumber = e.poNumber;
                                line.poHeaderId = e.id;
                                line.quantityOrder = e.poQuantity;
                                line.quantityGR = e.quantityGR;
                                line.unitPricePO = e.unitPrice;
                                line.itemNumber = e.partNo;
                                line.itemId = e.itemId;
                                line.isSkipInvCheck = e.isSkipInvCheck;
                            }
                        })
                    });
                    this.gridParams.api?.setRowData(this.listItem);
                    this.caculateAmount();
                }
            })
    }

    getAllPoNumber(params: any) {
        if (!this.selectedRow.vendorId) return this.notify.warn(this.l('ChoosePlease', this.l('VendorName')));
        else {
            return this._api.getAllPoNumberByVendor(this.selectedRow.vendorId);
        }
    }

    updateSupplier() {
        this.spinnerService.show();
        this._api.updateSupplier(this.selectedRow.vatRegistrationInvoice)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => {
                if (res.id == null) {
                    this.notify.warn(this.l('SupplierIsNotExist'));
                }
                else {
                    this.selectedRow.vendorId = res.id;
                    this.selectedRow.vendorName = res.supplierName;

                    this.listItem.forEach(item => {
                        item.vendorId = res.id;
                    })
                }
            })
    }

    changeActualTotalAmount(event: any) {
        if (!event || Number(event) != Number(this.totalAmountPo)) {
            this.totalAmountInput.input.nativeElement.style = 'background-color: #ffffb2 !important;';
        }
        else {
            this.totalAmountInput.input.nativeElement.style = 'background-color: #87ec68 !important;';
        }
        this.totalAmount = event;
    }

    changeTotalTaxActualAmount(event: any) {
        if (!event || Number(event) != Number(this.totalTaxAmountPo)) {
            this.totalAmountTaxInput.input.nativeElement.style = 'background-color: #ffffb2 !important;';
        }
        else {
            this.totalAmountTaxInput.input.nativeElement.style = 'background-color: #87ec68 !important;';
        }
        this.totalTaxAmount = event;
    }
}
