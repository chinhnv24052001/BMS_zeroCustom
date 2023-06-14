import { GridTableService } from '@app/shared/services/grid-table.service';
import { finalize } from 'rxjs/operators';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgCheckboxRendererComponent } from '@app/shared/common/grid-input-types/ag-checkbox-renderer/ag-checkbox-renderer.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { InvoiceServiceProxy, SearchInvoiceOutputDto, SearchInvoiceOutputDetailDto, PaymentHeadersServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { ApplyPrepaymentComponent } from './apply-prepayment/apply-prepayment.component';
import { CreateOrEditInvoicesComponent } from './create-or-edit-invoices/create-or-edit-invoices.component';
import { InvoiceImportMultipleComponent } from './invoice-import-multiple/invoice-import-multiple.component';
import { MatchedInvoiceComponent } from './matched-invoice/matched-invoice.component';
import { NoteModalComponent } from './note-modal/note-modal.component';

@Component({
    selector: 'invoices',
    templateUrl: './invoices.component.html',
    styleUrls: ['./invoices.component.less']
})
export class InvoicesComponent extends AppComponentBase implements OnInit {
    @ViewChild('createOrEditInvoices', { static: true }) createOrEditInvoices: CreateOrEditInvoicesComponent;
    @ViewChild('applyPrepayment', { static: true }) applyPrepayment: ApplyPrepaymentComponent;
    @ViewChild('listAllPrepayments', { static: true }) listAllPrepayments!: TmssSelectGridModalComponent;
    @ViewChild('importMutipleInvoice', { static: true }) importMutipleInvoice: InvoiceImportMultipleComponent;
    @ViewChild('matchedInvoice', { static: true }) matchedInvoice: MatchedInvoiceComponent;
    @ViewChild('noteModal', { static: true }) noteModal!: NoteModalComponent;

    unitOfMeasureForm: FormGroup;
    gridColDef: CustomColDef[];
    gridPrepaymentsDef: CustomColDef[];
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    paginationDetailParams: PaginationParamsModel = { pageNum: 1, pageSize: 2000, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
    gridParams: GridParams | undefined;
    selectedRow: SearchInvoiceOutputDto = new SearchInvoiceOutputDto();
    selectedDetailRow: any;
    listItem: SearchInvoiceOutputDto[] = [];

    @Input('params') params: any;

    isLoading = false;
    frameworkComponents;
    gridDetailColDef: CustomColDef[];
    gridDetailParams: GridParams | undefined;
    listDetailItem: SearchInvoiceOutputDetailDto[] = [];
    sources: { label: string, value: string }[] = [
        { label: 'All', value: '' },
        { label: 'Automatic', value: 'Automatic' },
        { label: 'Manual', value: 'Manual' }
    ];

    source: string = '';
    poNumber: string = '';
    createInvoiceDate: any;

    fromDateFilter: any;
    toDateFilter: any;

    @Input('invoiceNumFilter') invoiceNumFilter = "";
    @Input('invoiceSymbolFilter') invoiceSymbolFilter = "";

    vendorid = -1;
    vender;
    listStatus;
    statusText = "-1";
    vatRegistrationInvoice: string = '';
    picUserId: number | undefined;
    statusMatched: string = AppConsts.CPS_KEYS.STATUS_MATHCHED;
    userList: { label: string, value: number | undefined }[] = [];

    constructor(
        injector: Injector,
        private _invoiceServiceProxy: InvoiceServiceProxy,
        private formBuilder: FormBuilder,
        private grid: GridTableService,
        private dataFormatService: DataFormatService,
        private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy,
    ) {
        super(injector);

        this.frameworkComponents = {
            agCheckboxRendererComponent: AgCheckboxRendererComponent,
        };
        this.gridColDef = [
            {
                headerName: this.l("No."),
                headerTooltip: "No.",
                cellRenderer: (params) => (this.paginationParams.pageNum - 1) * this.paginationParams.pageSize + params.rowIndex + 1,
                field: "stt",
                pinned: true,
                width: 45,
            },
            {
                headerName: this.l('Inv.Symbol'),
                field: 'invoiceSymbol',
                sortable: true,
                width: 140,
            },
            {
                headerName: this.l('InvoiceNo'),
                field: 'invoiceNum',
                sortable: true,
                width: 120,
            },
            {
                headerName: this.l('VendorName'),
                field: 'vendorName',
                sortable: true,
                width: 350,
            },
            {
                headerName: this.l('VatRegistrationInvoice'),
                field: 'vatRegistrationInvoice',
                sortable: true,
                width: 140,
            },
            {
                headerName: this.l('VatRegistrationNum'),
                field: 'vatRegistrationNum',
                sortable: true,
                width: 140,
            },
            {
                headerName: this.l('Status'),
                field: 'status',
                sortable: true,
                width: 100,
            },
            {
                headerName: this.l('Source'),
                field: 'source',
                sortable: true,
                width: 100,
            },
            {
                headerName: this.l('InvoiceDate'),
                field: 'invoiceDate',
                valueGetter: params => params.data ? this.dataFormatService.dateFormat(params.data.invoiceDate) : "",
                sortable: true,
                cellClass: ['text-center'],
                width: 120,
            },
            {
                headerName: this.l('TotalActual'),
                field: 'totalAmount',
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
                cellClass: ['text-right'],
                sortable: true,
                width: 120,
            },
            {
                headerName: this.l('Currency'),
                field: 'currencyCode',
                cellClass: ['text-center'],
                sortable: true,
                width: 120,
            },
            {
                headerName: this.l('PicUser'),
                field: 'picInvoice',
                sortable: true,
                width: 160,
            }
        ]

        this.gridDetailColDef = [
            {
                headerName: this.l("No."),
                headerTooltip: "No.",
                cellRenderer: (params) => (this.paginationDetailParams.pageNum - 1) * this.paginationDetailParams.pageSize + params.rowIndex + 1,
                field: "stt",
                width: 45
            },
            {
                headerName: this.l('Status'),
                field: 'status',
                cellClass: ['text-center'],
                width: 90
            },
            {
                headerName: this.l('PoNumber'),
                field: 'poNumber',
                sortable: true,
                cellClass: ['text-left'],
                width: 100
            },
            {
                headerName: this.l('ItemNumber'),
                field: 'itemNumber',
                sortable: true,
                cellClass: ['text-left'],
                width: 140
            },
            {
                headerName: this.l('ItemDescription'),
                field: 'itemDescription',
                sortable: true,
                cellClass: ['text-left'],
                width: 200
            },
            {
                headerName: this.l('SL'),
                field: 'quantity',
                sortable: true,
                cellClass: ['text-right'],
                valueFormatter: params => params.data?.quantity ? this.dataFormatService.moneyFormat(params.value) : "0",
                width: 100
            },
            {
                headerName: this.l('SL PO'),
                field: 'quantityOrder',
                sortable: true,
                cellClass: ['text-right'],
                valueFormatter: params => params.data?.quantityOrder ? this.dataFormatService.moneyFormat(params.value) : "0",
                width: 100
            },
            {
                headerName: this.l('QuantityGR'),
                field: 'quantityGR',
                sortable: true,
                cellClass: ['text-right'],
                width: 140,
                valueFormatter: params => params.data?.quantityGR ? this.dataFormatService.moneyFormat(params.value) : "0",
            },
            {
                headerName: this.l('QuantityPayment'),
                field: 'quantityPayment',
                sortable: true,
                cellClass: ['text-right'],
                width: 140,
                valueFormatter: params => params.data?.quantityPayment ? this.dataFormatService.moneyFormat(params.value) : "0",
            },
            {
                headerName: this.l('QtyRemainGR'),
                sortable: true,
                cellClass: ['text-right'],
                width: 140,
                valueGetter: params => params.data ? (params.data.quantityGR ?? 0) - (params.data.quantityPayment ?? 0) : 0,
            },
            {
                headerName: this.l('ForeignPriceInv'),
                field: 'foreignPrice',
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
                sortable: true,
                cellClass: ['text-right'],
                width: 140
            },
            {
                headerName: this.l('AmountInv'),
                field: 'amount',
                sortable: true,
                cellClass: ['text-right'],
                width: 140,
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.value) : "",
            },
            {
                headerName: this.l('Tax'),
                field: 'amountVat',
                sortable: true,
                cellClass: ['text-right'],
                width: 140,
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.data?.foreignPrice * params.data?.quantity * params.data?.taxRate / 100) : '',
            },
            {
                headerName: this.l('Amount'),
                field: 'totalAmount',
                sortable: true,
                cellClass: ['text-right'],
                width: 140,
                valueFormatter: params => params.data ? this.dataFormatService.moneyFormat(params.data?.foreignPrice * params.data?.quantity + params.data?.foreignPrice * params.data?.quantity * params.data?.taxRate / 100) : '',
            }
        ]

        this.gridPrepaymentsDef = [
            {
                headerName: this.l(''),
                headerTooltip: this.l(''),
                field: 'checked',
                cellRenderer: 'agCheckboxRendererComponent',
                data: [true, false],
                cellClass: ['cell-border', 'text-center'],
                width: 50,
            },
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                width: 2,
            },
            {
                headerName: this.l('PoNo'),
                headerTooltip: this.l('PoNo'),
                field: 'poNo'
            },
            {
                headerName: this.l('SupplierName'),
                headerTooltip: this.l('SupplierName'),
                field: 'supplierName'
            },
            {
                headerName: this.l('AdvancedDate'),
                headerTooltip: this.l('AdvancedDate'),
                field: 'advancedDate',
                valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.advancedDate) : "",
            },
            {
                headerName: this.l('Amount'),
                headerTooltip: this.l('Amount'),
                field: 'amount'
            },
        ];

        this.gridPrepaymentsDef = [
            {
                headerName: this.l(''),
                headerTooltip: this.l(''),
                field: 'checked',
                cellRenderer: 'agCheckboxRendererComponent',
                data: [true, false],
                cellClass: ['cell-border', 'text-center'],
                width: 50,
            },
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
                width: 2,
            },
            {
                headerName: this.l('PoNo'),
                headerTooltip: this.l('PoNo'),
                field: 'poNo'
            },
            {
                headerName: this.l('SupplierName'),
                headerTooltip: this.l('SupplierName'),
                field: 'supplierName'
            },
            {
                headerName: this.l('AdvancedDate'),
                headerTooltip: this.l('AdvancedDate'),
                field: 'advancedDate',
                valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.advancedDate) : "",
            },
            {
                headerName: this.l('Amount'),
                headerTooltip: this.l('Amount'),
                field: 'amount'
            },
        ];

    }

    ngOnInit(): void {
        this.invoiceNumFilter = this.params.invoiceNumFilter ?? "";
        this.invoiceSymbolFilter = this.params.invoiceSymbolFilter ?? "";
        this.getCache();
        this.getInvoices();
    }

    getCache() {
        this.vender = [];
        this.vender.push({ label: 'All', value: -1, code: 'All' })
        this._invoiceServiceProxy.getAllVendor().subscribe(res => {
            res.forEach(element => {
                this.vender.push({ label: element.supplierName, value: element.id, code: element.supplierNumber })
            })

        });
        this.listStatus = [];
        this.listStatus.push({ label: 'All', value: '-1' });
        this._invoiceServiceProxy.getStatus().subscribe(res => {
            res.forEach(element => {
                this.listStatus.push({ label: element.name, value: element.name })
            })
        });
        this.vender = [...this.vender];
        this.listStatus = [...this.listStatus];

        this.userList = [];
        this.userList.unshift({ label: '', value: undefined });
        this._invoiceServiceProxy.getAllUserForCombobox().subscribe(res => {
            res.map(e => {
                this.userList.push({
                    label: e.userNameAndEmail,
                    value: e.id
                })
            })
        })
    }

    getData() {
        return this._invoiceServiceProxy.getInvoiceSearch(
            this.invoiceNumFilter ?? '',
            this.invoiceSymbolFilter ?? '',
            '',
            this.vendorid ?? undefined,
            this.fromDateFilter ?? undefined,
            this.toDateFilter ?? undefined,
            this.statusText ?? '',
            this.source ?? '',
            this.poNumber ?? '',
            this.vatRegistrationInvoice ?? '',
            this.createInvoiceDate ?? undefined,
            this.picUserId ?? undefined,
            (this.paginationParams ? this.paginationParams.sorting : ''),
            (this.paginationParams ? this.paginationParams.pageSize : 20),
            (this.paginationParams ? this.paginationParams.skipCount : 1)
        )
    }
    // get data
    getInvoices() {
        this.spinnerService.show();
        this.listDetailItem = [];
        this.getData()
            .pipe(finalize(() => {
                this.spinnerService.hide();
                this.grid.selectFirstRow(this.gridParams.api)
            }))
            .subscribe((res) => {
                this.listItem = res.items;
                this.paginationParams.totalCount = res.totalCount;
                this.paginationParams.totalPage = ceil(res.totalCount / this.paginationParams.pageSize);
            });
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        if (!this.listItem) {
            return;
        }
        this.paginationParams = paginationParams;
        this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
        this.paginationParams.pageSize = paginationParams.pageSize;
        this.getInvoices();
    }

    callBackGrid(params: GridParams) {
        this.gridParams = params;
    }

    onChangeSelection(params) {
        this.selectedRow = params.api.getSelectedRows()[0] ?? new SearchInvoiceOutputDto();
        this.spinnerService.show();
        this._invoiceServiceProxy.getInvoiceSearchDetail(this.selectedRow.id, this.statusText)
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(res => {
                this.listDetailItem = res;
            });
    }

    callBackDetailGrid(params: GridParams) {
        this.gridDetailParams = params;
    }

    onChangeDetailSelection(params) {
        this.selectedDetailRow =
            params.api.getSelectedRows()[0] ?? new SearchInvoiceOutputDto();

        this.selectedDetailRow = Object.assign({}, this.selectedDetailRow);
    }


    addInventoryItem() {
        this.createOrEditInvoices.show()
    }

    editInventoryItem() {
        if (!this.selectedRow.id) {
            // show notification select row
            this.notify.error(this.l('Please Select Row'));
        }
        else {
            this.createOrEditInvoices.show(this.selectedRow)
        }
    }

    showPrepayment() {
        if (!this.selectedRow) {
            this.notify.warn(AppConsts.CPS_KEYS.Please_Select_1_Line_To_SetUp);
            return;
        }

        //this.listAllPrepayments.show();
        //this.applyOrUnapplyPrepayment.show(-1);
        this.applyPrepayment.show(this.selectedRow);
    }

    setLoading(params) {
        this.isLoading = params;
    }
    patchSelectedPrepayment(event: any) {

    }

    getAllPrepayments(suplierName: any, paginationParams: PaginationParamsModel) {
        return this._paymentHeadersServiceProxy.getAllPrepaymentForInvoices(
            "",
            this.selectedRow.vendorId,
            this.selectedRow.vendorSiteId,
            this.selectedRow.id,
            (this.paginationParams ? this.paginationParams.sorting : ''),
            (this.paginationParams ? this.paginationParams.pageSize : 100),
            (this.paginationParams ? this.paginationParams.skipCount : 1)
        );
    }

    view() {
        if (!this.selectedRow.id) {
            // show notification select row
            this.notify.error(this.l('Please Select Row'));
        }
        else {
            this.createOrEditInvoices.view(this.selectedRow)
        }
    }

    cancelInvoice(params: string) {
        this.spinnerService.show();
        let body = Object.assign({
            id: this.selectedRow.id,
            cancelReason: params
        });
        this._invoiceServiceProxy.cancelInvoice(body)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(() => this.notify.success(this.l('Successfully')));
    }

    deleteInvoice() {
        this.message.confirm(this.l('DeleteThisSelection'), this.l('AreYouSure'), (isConfirmed) => {
            if (isConfirmed) {
                if (this.selectedRow.status == AppConsts.CPS_KEYS.STATUS_MATHCHED) {
                    this.notify.warn(this.l('CannotDeleteInvoiceStatusMatched'));
                    return;
                }
                else {
                    this.spinnerService.show();
                    this._invoiceServiceProxy.deleteInvoice(this.selectedRow.id)
                        .pipe(finalize(() => {
                            this.spinnerService.hide();
                            this.getInvoices();
                        }))
                        .subscribe(() => this.notify.success(this.l('DeleteSuccessfully')))
                }
            }
        })
    }
}
