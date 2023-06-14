import { forEach } from 'lodash-es';
import { CommonGetGlExchangeRateDto, CommonLookupServiceProxy, GetAllApprovalInfoForViewDto, GetAllUserRequestAttachmentsForViewDto, RequestApprovalServiceProxy, CommonDefaultParameterDto, GetAllReferenceInfoForViewDto, RequestNextApprovalTreeInputDto } from './../../../../../shared/service-proxies/service-proxies';
import { finalize, filter } from 'rxjs/operators';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, Injector, ViewChild, Output, EventEmitter, Input, ElementRef } from '@angular/core';
import { CreateRequestApprovalInputDto, GetAllProductsForViewDto, GetAllUserRequestForViewDto, GetUserRequestDetailForView, RequestApprovalTreeServiceProxy, UrUserRequestManagementServiceProxy, CommonGeneralCacheServiceProxy, CommonAllGlCodeCombination, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { ValueGetterParams, RowNode, ICellEditorParams, ValueFormatterParams } from '@ag-grid-enterprise/all-modules';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { GridTableService } from '@app/shared/services/grid-table.service';
import * as moment from 'moment';
import { HttpClient } from '@angular/common/http';
import { AppConsts } from '@shared/AppConsts';
import * as FileSaver from 'file-saver';
import { AgCellButtonRendererComponent } from '@app/shared/common/grid-input-types/ag-cell-button-renderer/ag-cell-button-renderer.component';

@Component({
    selector: 'view-user-request-modal',
    templateUrl: './view-user-request-modal.component.html',
    styleUrls: ['./view-user-request-modal.component.less']
})
export class ViewUserRequestModalComponent extends AppComponentBase {
    @Output() modalSave: EventEmitter<any> = new EventEmitter();

    @Output() approveEvent: EventEmitter<any> = new EventEmitter();
    @Output() rejectEvent: EventEmitter<any> = new EventEmitter();
    @Output() requestMoreInfoEvent: EventEmitter<any> = new EventEmitter();
    @Output() forwardEvent: EventEmitter<any> = new EventEmitter();


    @ViewChild('viewURModal', { static: true }) modal!: ModalDirective;
    @ViewChild('selectProductModal', { static: true }) selectProductModal!: TmssSelectGridModalComponent;
    @ViewChild('selectBudgetCodeModal', { static: true }) selectBudgetCodeModal!: TmssSelectGridModalComponent;
    @ViewChild('selectBudgetCodeHeadModal', { static: true }) selectBudgetCodeHeadModal!: TmssSelectGridModalComponent;
    @ViewChild('selectUomModal', { static: true }) selectUomModal!: TmssSelectGridModalComponent;
    @ViewChild('imgInput', { static: false }) InputVar: ElementRef;

    @Input() viewOnly = false;
    @Input() hasRequestInfo = false;

    selectedUR: GetUserRequestDetailForView = new GetUserRequestDetailForView();
    productsColDef: CustomColDef[] = [];
    approvalColDef: CustomColDef[] = [];
    referenceColDef: CustomColDef[] = [];
    productsColDefForView: CustomColDef[];
    productColDefs: CustomColDef[] = [];
    budgetCodeColDefs: CustomColDef[] = [];
    attachmentsColDefs: CustomColDef[] = [];
    uomColDefs: CustomColDef[] = [];
    defaultColDef: CustomColDef = {
        suppressMenu: true
    };
    productParams: GridParams;
    selectedProductNode: RowNode;
    selectedAttachmentNode: RowNode;
    frameworkComponents: any;

    selectedProduct: GetAllProductsForViewDto = new GetAllProductsForViewDto();

    warning: boolean = false;
    totalPrice: string = '0';
    originalTotalPrice: string = '0';
    purposes: { label: string, value: number | undefined }[] = [];
    inventoryGroups: { label: string, value: number | undefined }[] = [];
    currencies: { label: string, value: number | undefined }[] = [];
    documentTypes: { label: string, value: number | undefined }[] = [
        { label: 'User Request', value: undefined }
    ];
    approvalInfos: GetAllApprovalInfoForViewDto[] = [];
    referenceInfo: GetAllReferenceInfoForViewDto[] = [];
    approvalStatus: string = '';
    userRequestStorage: GetUserRequestDetailForView = new GetUserRequestDetailForView();
    downloadUrl: string = AppConsts.remoteServiceBaseUrl + '/AttachFile/GetAttachFileToDownload';
    uploadUrl: string = AppConsts.remoteServiceBaseUrl + '/AttachFile/UploadFileToFolder';
    removeUrl: string = AppConsts.remoteServiceBaseUrl + '/AttachFile/RemoveAttachFile';
    attachmentsParams: GridParams;
    selectedAttachment: GetAllUserRequestAttachmentsForViewDto = new GetAllUserRequestAttachmentsForViewDto();
    currentUserId: number = abp.session.userId;
    fileName: string = '';
    uploadData: any[] = [];
    newAttachments: any[] = [];
    exchangeRates: CommonGetGlExchangeRateDto[] = [];
    conversionRate: number = 1;
    defaultParameter: CommonDefaultParameterDto = new CommonDefaultParameterDto();
    deliveryDate: any;
    uomList: any[] = [];

    constructor(
        injector: Injector,
        private _dataFormatService: DataFormatService,
        private _serviceProxy: UrUserRequestManagementServiceProxy,
        private _approvalProxy: RequestApprovalTreeServiceProxy,
        private _cacheProxy: CommonGeneralCacheServiceProxy,
        private gridTableService: GridTableService,
        private _http: HttpClient,
        private _requetApproval: RequestApprovalServiceProxy,
        private _fileApi: CommonLookupServiceProxy,
        private _uomProxy: MstUnitOfMeasureServiceProxy
    ) {
        super(injector);
        this.frameworkComponents = {
            agDatepickerRendererComponent: AgDatepickerRendererComponent,
            agCellButtonComponent: AgCellButtonRendererComponent
        };
        this.productsColDef = [
            {
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: (params) => params.rowIndex + 1,
                cellClass: ['text-center'],
                width: 60
            },
            {
                headerName: this.l('ProductCode'),
                headerTooltip: this.l('ProductCode'),
                cellClass: ['text-left', 'cell-clickable'],
                field: 'productCode',
                rowDrag: true,
                editable: true,
                width: 130
            },
            {
                headerName: this.l('ProductName'),
                headerTooltip: this.l('ProductName'),
                cellClass: ['text-left'],
                field: 'productName',
                editable: (params) => !params.data.productCode ? true : false,
                width: 300
            },
            {
                headerName: this.l('SupplierName'),
                headerTooltip: this.l('SupplierName'),
                field: 'supplierName',
                cellClass: ['text-left'],
                width: 200
            },
            {
                headerName: this.l('Uom'),
                headerTooltip: this.l('Uom'),
                cellClass: ['text-center', 'cell-clickable'],
                field: 'uom',
                editable: (params) => !params.data.productCode ? true : false,
                width: 80
            },
            {
                headerName: this.l('Quantity'),
                headerTooltip: this.l('Quantity'),
                cellClass: ['text-right cell-clickable'],
                field: 'quantity',
                editable: true,
                width: 70
            },
            {
                headerName: this.l('Price'),
                headerTooltip: this.l('Price'),
                cellClass: ['text-right', 'cell-clickable'],
                field: 'unitPrice',
                editable: (params) => !params.data.productCode ? true : false,
                valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.moneyFormat(params.value),
                width: 90
            },
            {
                headerName: this.l('TotalPrice'),
                headerTooltip: this.l('TotalPrice'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? Number(params.data.quantity * params.data.unitPrice) : 0,
                valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.moneyFormat(params.value),
                width: 100
            },
            {
                headerName: this.l('DeliveryDate'),
                headerTooltip: this.l('DeliveryDate'),
                cellClass: ['text-left', 'cell-clickable'],
                field: 'deliveryDate',
                editable: true,
                cellRenderer: 'agDatepickerRendererComponent',
                valueGetter: params => this._dataFormatService.dateTimeFormat(params.data.doingDate),
                width: 140
            },
            {
                headerName: this.l('BudgetCode'),
                headerTooltip: this.l('BudgetCode'),
                cellClass: ['text-left', 'cell-clickable'],
                field: 'budgetCode',
                rowDrag: true,
                editable: true,
                width: 250
            },
            {
                headerName: this.l('MonthN'),
                headerTooltip: this.l('MonthN'),
                cellClass: ['text-right cell-clickable'],
                field: 'monthN',
                editable: true,
                width: 70
            },
            {
                headerName: this.l('MonthN1'),
                headerTooltip: this.l('MonthN1'),
                cellClass: ['text-right cell-clickable'],
                field: 'monthN1',
                editable: true,
                width: 70
            },
            {
                headerName: this.l('MonthN2'),
                headerTooltip: this.l('MonthN2'),
                cellClass: ['text-right cell-clickable'],
                field: 'monthN2',
                editable: true,
                width: 70
            },
            {
                headerName: this.l('MonthN3'),
                headerTooltip: this.l('MonthN3'),
                cellClass: ['text-right cell-clickable'],
                field: 'monthN3',
                editable: true,
                width: 70
            },
        ];

        this.approvalColDef = [
            {
                // STT
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: (params) => params.rowIndex + 1,
                cellClass: ['cell-border', 'text-center'],
                width: 50,
            },
            {
                headerName: this.l('Step'),
                headerTooltip: this.l('Step'),
                field: 'approvalSeq',
                cellClass: ['cell-border', 'custom-grid-text', 'custom-grid-cbb-text', 'text-center'],
                width: 60,
            },
            {
                headerName: this.l('UserApprove'),
                headerTooltip: this.l('UserApprove'),
                field: 'approvalUserName',
                cellClass: ['cell-border', 'text-left'],
                width: 140,
            },
            {
                headerName: this.l('Department'),
                headerTooltip: this.l('Department'),
                field: 'approvalUserDepartment',
                cellClass: ['cell-border', 'text-left'],
                width: 150,
            },
            {
                headerName: this.l('Titles'),
                headerTooltip: this.l('Titles'),
                field: 'approvalUserTitle',
                cellClass: ['cell-border', 'text-left'],
                width: 150,
            },
            {
                headerName: this.l('LeadTime'),
                headerTooltip: this.l('LeadTime'),
                field: 'leadTime',
                valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.dateFormat(params.value),
                cellClass: ['cell-border', 'text-left'],
                width: 120,
            },
            {
                headerName: this.l('ApproveDate'),
                headerTooltip: this.l('ApproveDate'),
                field: 'approvalDate',
                valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.dateFormat(params.value),
                cellClass: ['cell-border', 'text-left'],
                width: 120,
            },
            {
                headerName: this.l('RejectDate'),
                headerTooltip: this.l('RejectDate'),
                field: 'rejectDate',
                valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.dateFormat(params.value),
                cellClass: ['cell-border', 'text-left'],
                width: 120,
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                field: 'approvalStatus',
                cellClass: ['cell-border', 'text-center'],
                valueFormatter: (params) => params.data ? this.handleStatus(params.data?.approvalStatus) : '',
                width: 100,
            },
            {
                headerName: this.l('Note'),
                headerTooltip: this.l('Note'),
                field: 'note',
                cellClass: ['cell-border', 'text-left'],
                width: 200,
            },
        ];

        this.referenceColDef = [
            {
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: (params) => params.rowIndex + 1,
                flex: 0.3
            },
            {
                headerName: this.l('TransactionType'),
                headerTooltip: this.l('TransactionType'),
                field: 'type',
                cellClass: ['cell-border'],
                flex: 1
            },
            {
                headerName: this.l('VoucherNumber'),
                headerTooltip: this.l('VoucherNumber'),
                field: 'referenceNum',
                cellClass: ['cell-border'],
                flex: 1
            },
            {
                headerName: this.l('VoucherNumberNo'),
                headerTooltip: this.l('VoucherNumberNo'),
                field: 'referenceLineNum',
                cellClass: ['cell-border'],
                flex: 1
            },
            {
                headerName: this.l('VoucherNumberNoUr'),
                headerTooltip: this.l('VoucherNumberNoUr'),
                field: 'lineNum',
                cellClass: ['cell-border'],
                flex: 1
            }
        ];

        this.productColDefs = [
            {
                headerName: this.l('ProductCode'),
                headerTooltip: this.l('ProductCode'),
                cellClass: ['text-center'],
                field: 'productCode',
                flex: 0.4
            },
            {
                headerName: this.l('ProductName'),
                headerTooltip: this.l('ProductName'),
                cellClass: ['text-left'],
                field: 'productName',
                flex: 0.8
            },
            {
                headerName: this.l('UOM'),
                headerTooltip: this.l('UOM'),
                cellClass: ['text-center'],
                field: 'uom',
                flex: 0.3
            },
            {
                headerName: this.l('UnitPrice'),
                headerTooltip: this.l('UnitPrice'),
                cellClass: ['text-center'],
                field: 'unitPrice',
                valueGetter: (params: ValueGetterParams) => params.data ? this._dataFormatService.moneyFormat(params.data?.unitPrice) : 0,
                flex: 0.3
            },
            {
                headerName: this.l('SupplierName'),
                headerTooltip: this.l('SupplierName'),
                cellClass: ['text-center'],
                field: 'supplierName',
                flex: 0.6
            },
        ];

        this.budgetCodeColDefs = [
            {
                headerName: this.l('BudgetCode'),
                headerTooltip: this.l('BudgetCode'),
                cellClass: ['text-center'],
                field: 'concatenatedSegments',
                flex: 1
            }
        ];

        this.attachmentsColDefs = [
            {
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: (params) => params.rowIndex + 1,
                cellClass: ['text-center'],
                flex: 0.2
            },
            {
                headerName: this.l('Download'),
                headerTooltip: this.l('Download'),
                cellClass: ['text-center'],
                cellRenderer: "agCellButtonComponent",
                buttonDef: {
                    iconName: 'fa fa-file-download mr-0',
                    className: 'grid-btn',
                    function: params => this.dowloadAttachment(true, params),
                    disabled: params => params.data.id == undefined
                },
                flex: 0.2
            },
            {
                headerName: this.l('FileName'),
                headerTooltip: this.l('FileName'),
                cellClass: ['text-center'],
                field: 'fileName',
                flex: 1
            },
            {
                headerName: this.l('UploadTime'),
                headerTooltip: this.l('UploadTime'),
                cellClass: ['text-center'],
                field: 'uploadTime',
                valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.dateTimeFormat(params.value),
                flex: 0.7
            },
            {
                headerName: this.l('Location'),
                headerTooltip: this.l('Location'),
                cellClass: ['text-center'],
                valueGetter: (params: ValueGetterParams) => params.data?.id ? this.l('OnSystem') : this.l('New'),
                flex: 0.8
            },
        ];

        this.uomColDefs = [
            {
                headerName: this.l('UomCode'),
                headerTooltip: this.l('UomCode'),
                cellClass: ['text-center'],
                field: 'uomCode',
                flex: 1
            },
            {
                headerName: this.l('UnitOfMeasure'),
                headerTooltip: this.l('UnitOfMeasure'),
                cellClass: ['text-center'],
                field: 'unitOfMeasure',
                flex: 1
            },
        ];
    }

    ngOnInit() {
        this.getAllPurchasePurpose();
        this.getAllInventoryGroup();
        this.getAllCurrency();
        this.getAllExchangeRate();
        this.getDefaultParameter();
        this.getAllUom();
    }

    setColDef() {
        if (this.viewOnly) {
            this.productsColDef = [
                {
                    headerName: this.l('No.'),
                    headerTooltip: this.l('No.'),
                    cellRenderer: (params) => params.rowIndex + 1,
                    cellClass: ['text-center'],
                    flex: 0.3
                },
                {
                    headerName: this.l('ProductCode'),
                    headerTooltip: this.l('ProductCode'),
                    cellClass: ['text-left'],
                    field: 'productCode',
                    // editable: (params) => params.data?.type == 0 ? true : false,
                    flex: 0.8
                },
                {
                    headerName: this.l('ProductName'),
                    headerTooltip: this.l('ProductName'),
                    cellClass: ['text-left'],
                    field: 'productName',
                    // editable: (params) => params.data?.type == 1 ? true : false,
                    flex: 1.5
                },
                {
                    headerName: this.l('Quantity'),
                    headerTooltip: this.l('Quantity'),
                    field: 'quantity',
                    //editable: true,
                    flex: 0.5
                },
                {
                    headerName: this.l('Price'),
                    headerTooltip: this.l('Price'),
                    cellClass: ['text-right'],
                    field: 'unitPrice',
                    valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.moneyFormat(params.value),
                    flex: 0.8
                },
                {
                    headerName: this.l('TotalPrice'),
                    headerTooltip: this.l('TotalPrice'),
                    cellClass: ['text-right'],
                    valueGetter: (params: ValueGetterParams) => params.data ? Number(params.data.quantity * params.data.unitPrice) : 0,
                    valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.moneyFormat(params.value),
                    flex: 0.8
                },
                {
                    headerName: this.l('RequestDate'),
                    headerTooltip: this.l('RequestDate'),
                    cellClass: ['text-right'],
                    valueGetter: (params: ValueGetterParams) => params.data ? this._dataFormatService.dateFormat(params.data?.requestDate) : '',
                    flex: 0.5
                },
                {
                    headerName: this.l('DeliveryDate'),
                    headerTooltip: this.l('DeliveryDate'),
                    cellClass: ['text-right'],
                    valueGetter: (params: ValueGetterParams) => params.data ? this._dataFormatService.dateFormat(params.data?.deliveryDate) : '',
                    flex: 0.5
                },
            ];

        }
        this.productParams.api.setColumnDefs(this.productsColDef);
    }

    currentHeaderId: any = 0;
    replyRequest() {
        this._requetApproval.replyFromHeader(this.currentHeaderId, this.selectedUR.replyNote).subscribe(e => {
            this.notify.success("Successfully Reply")
        })
    }

    show(userRequest: GetAllUserRequestForViewDto) {
        this.currentHeaderId = userRequest.id;
        this.spinnerService.show();
        this._serviceProxy.getUrDetail(userRequest.id)
            .pipe(finalize(() => {
                this.spinnerService.hide();
                this.setColDef();
                this.getApprovalInfos();
                this.getAllReferenceInfo();
                this.modal.show();
                this.getExchangeRate();
            }))
            .subscribe(res => {
                this.selectedUR = res;
                let name = "";
                if ((this.selectedUR.replyNote ?? "").split(":").length > 1) name = (this.selectedUR.replyNote ?? "").split(":")[0];
                this.selectedUR.replyNote = (this.selectedUR.replyNote ?? "").slice(name.length >= 1 ? name.length + 1 : 0, (this.selectedUR.replyNote ?? "").length);

                this.userRequestStorage = res;
                this.totalPrice = this.formartMoney(this.selectedUR.totalPrice);
                this.originalTotalPrice = this.formartMoney(this.selectedUR.originalTotalPrice);
                this.approvalStatus = this.handleStatus(this.selectedUR.approvalStatus);
            });
        this.newAttachments = [];
    }

    getApprovalInfos() {
        this.approvalInfos = [];
        this.spinnerService.show();
        this._serviceProxy.getAllApprovalInfo(this.selectedUR.id, "UR")
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => this.approvalInfos = res);
    }

    getAllReferenceInfo() {
        this.referenceInfo = [];
        this.spinnerService.show();
        this._serviceProxy.getAllReferenceInfo(this.selectedUR.id, 'UR')
        .pipe(finalize(() => this.spinnerService.hide()))
        .subscribe(res => this.referenceInfo = res);
    }

    getAllInventoryGroup() {
        this.spinnerService.show();
        this.inventoryGroups = [];
        this.inventoryGroups.unshift({
            label: '',
            value: undefined
        });
        this._cacheProxy.getAllInventoryGroups()
            .pipe(finalize(() => {
                this.spinnerService.hide()
                // this.inventoryGroups = [...this.inventoryGroups]
            }))
            .subscribe(res => res.map(e => this.inventoryGroups.push({
                label: e.productGroupName,
                value: e.id
            })));
    }

    getAllCurrency() {
        this.spinnerService.show();
        this.currencies = [];
        this.currencies.unshift({
            label: '',
            value: undefined
        });
        this._cacheProxy.getAllCurrencies()
            .pipe(finalize(() => {
                this.spinnerService.hide();
                // this.selectedUR.currencyId = 7;
            }))
            .subscribe(res =>
                res.map(e => this.currencies.push({
                    label: e.currencyCode,
                    value: e.id
                }))
            )
    }

    getAllUom() {
        this.uomList = [];
        this.spinnerService.show();
        this._uomProxy.getAllUmoNotPaged(
            '', '', ''
        )
        .pipe(finalize(() => this.spinnerService.hide()))
        .subscribe(res => {
            this.uomList = res;
        });
    }

    close() {
        this.modal.hide();
    }

    formartMoney(params: number) {
        return this._dataFormatService.moneyFormat(params);
    }

    validateBeforeSendRequest() {
        this.warning = false;
        if (this.selectedUR != this.userRequestStorage) {
            this.warning = true;
            return this.notify.warn(this.l('DataIsChanged'));
        }
        if (this.selectedUR.budgetCodeId == null) {
            this.warning = true;
            return this.notify.warn(this.l('CannotBeEmpty', this.l('BudgetCode')));
        }
        return this.warning;
    }

    sendRequest() {
        this.validateBeforeSendRequest();
        if (this.warning) return;
        else {
            // let body = Object.assign(new CreateRequestApprovalInputDto(), {
            //     reqId: this.selectedUR.id,
            //     processTypeCode: 'UR'
            // })

            // this.spinnerService.show();
            // this._approvalProxy.createRequestApprovalTree(body)
            //     .pipe(finalize(() => {
            //         this.spinnerService.hide();
            //         this.modalSave.emit(null);
            //         this.modal.hide();
            //     }))
            //     .subscribe(res => this.notify.success(this.l('Successfully')))

            let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
                reqId: this.selectedUR.id,
                processTypeCode: 'UR'
            })

            this.spinnerService.show();
            this._approvalProxy.requestNextApprovalTree(body)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                    this.modalSave.emit(null);
                    this.modal.hide();
                }))
                .subscribe(res => this.notify.success(this.l('Successfully')))
        }
    }

    callBackProductColDef(params: GridParams) {
        this.productParams = params;
    }

    onChangeProductSelection(params: GridParams) {
        let selectedNode = params.api?.getSelectedNodes()[0];
        if (this.selectedProduct) this.selectedProductNode = selectedNode;
    }

    addRow() {
        this.productParams?.api.stopEditing();
        let breakForEach: boolean = false;
        this.productParams?.api?.forEachLeafNode((node: RowNode) => {
            if (!breakForEach && (!Number(node.data.quantity) || Number(node.data.quantity) < 0 || (node.data.type == 0 && !node.data.productCode) || (node.data.type == 1 && !node.data.productName))) {
                breakForEach = true;
                setTimeout(() => this.productParams.api.startEditingCell({ colKey: 'productCode', rowIndex: node.rowIndex }));
                return this.notify.warn(this.l('DataIsEmpty'));
            }
        });
        if (breakForEach) return true;
        else {
            this.productParams?.api.applyTransaction({ add: [{}] });
            const rowIndex = this.productParams.api.getDisplayedRowCount() - 1;
            setTimeout(() => {
                this.productParams.api.startEditingCell({ colKey: 'productCode', rowIndex });
                this.selectedProductNode = this.productParams.api.getRowNode(`${rowIndex}`);
                this.productParams.api.getRowNode(`${rowIndex}`).setSelected(true);
            });
            this.caculateTotalPrice();
        }
    }

    searchByEnter(params: ICellEditorParams) {
        const col = params?.colDef?.field;
        if (col === 'productCode') {
            var format = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/;
            var valueFilter = params.value?.toUpperCase().split(' ')[0].split('').filter(e => !format.test(e)).join('').trim();
            this.selectedProductNode.setDataValue('productCode', valueFilter);
            params.data.productCode = valueFilter;
            this.selectProductModal.show(
                valueFilter,
                undefined,
                undefined,
                'productCode'
            );
        }

        if (col === 'budgetCode') {
            var format = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]*$/;
            var valueFilter = params.value?.toUpperCase().split(' ')[0].split('').filter(e => !format.test(e)).join('').trim();
            this.selectedProductNode.setDataValue('budgetCode', valueFilter);
            params.data.budgetCode = valueFilter;
            this.selectBudgetCodeModal.show(
                valueFilter,
                undefined,
                undefined,
                'budgetCode'
            );
        }

        if (col === 'uom') {
            var format = /^[!@#$%^&*()_+\-=\[\]{};':"\\|,<>\/?]*$/;
            var valueFilter = params.value?.toUpperCase().split(' ')[0].split('').filter(e => !format.test(e)).join('').trim();
            this.selectedProductNode.setDataValue('uom', valueFilter);
            params.data.uom = valueFilter;
            this.selectUomModal.show(
                valueFilter,
                this.uomList,
                undefined,
                'uom'
            );
        }
    }

    deleteRow() {
        this.productParams?.api.applyTransaction({ remove: [this.selectedProductNode.data] });
        this.selectedUR.products = [];
        this.selectedUR.products = this.gridTableService.getAllData(this.productParams);
        this.caculateTotalPrice();
    }

    agKeyUp(event: KeyboardEvent) {
        event.stopPropagation();
        if (event.key === 'ArrowDown') this.addRow();
    }

    getAllProducts(productCode: string, paginationParams: PaginationParamsModel) {
        return this._serviceProxy.getAllProducts(
            this.selectedUR.inventoryGroupId ?? undefined,
            productCode ?? '',
            this.selectedUR.originalCurrencyId ?? undefined,
            paginationParams ? paginationParams.sorting : '',
            paginationParams ? paginationParams.pageSize : 20,
            paginationParams ? paginationParams.skipCount : 0
        );
    }

    getAllGlCode(budgetCode: string, paginationParams: PaginationParamsModel) {
        return this._cacheProxy.getAllGlCodeCombinations(
            budgetCode ?? '',
            paginationParams ? paginationParams.sorting : '',
            paginationParams ? paginationParams.pageSize : 20,
            paginationParams ? paginationParams.skipCount : 0
        );
    }

    patchProduct(event: GetAllProductsForViewDto) {
        if (!event || !event.inventoryItemId) {
            this.selectedProductNode.data = Object.assign(new GetAllProductsForViewDto());
            this.productParams.api.applyTransaction({ update: [this.selectedProductNode.data] });
            setTimeout(() => this.productParams.api.startEditingCell({ colKey: 'productCode', rowIndex: this.selectedProductNode.rowIndex }));
            this.selectedUR.products = this.gridTableService.getAllData(this.productParams);
            return this.notify.warn(this.l('CannotFind', this.l('Product')));
        }
        if (this.selectedUR.products.some((e, index) => e.productCode === event.productCode && this.selectedProductNode.rowIndex !== index)) {
            setTimeout(() => this.productParams.api.startEditingCell({ colKey: 'productCode', rowIndex: this.selectedProductNode.rowIndex }));
            return this.notify.warn(this.l('IsAlreadyExisted', this.l('Product')));
        }
        this.selectedProductNode.data = Object.assign(new GetAllProductsForViewDto(), event, { quantity: 1 });
        this.productParams.api.applyTransaction({ update: [this.selectedProductNode.data] });
        setTimeout(() => this.productParams.api.startEditingCell({ colKey: 'quantity', rowIndex: this.selectedProductNode.rowIndex }));
        this.selectedUR.products = this.gridTableService.getAllData(this.productParams);
    }

    patchBudgetCode(event: CommonAllGlCodeCombination, isGrid: boolean) {
        if (isGrid) {
            if (!event || !event.id) {
                setTimeout(() => this.productParams.api.startEditingCell({ colKey: 'budgetCode', rowIndex: this.selectedProductNode.rowIndex }));
                this.selectedUR.products = this.gridTableService.getAllData(this.productParams);
                return this.notify.warn(this.l('CannotFind', this.l('BudgetCode')));
            }
            this.selectedProductNode.data = Object.assign(this.selectedProductNode.data, { budgetCode: event.concatenatedSegments, budgetCodeId: event.id });
            this.productParams.api.applyTransaction({ update: [this.selectedProductNode.data] });
            // setTimeout(() => this.productParams.api.startEditingCell({ colKey: 'quantity', rowIndex: this.selectedProductNode.rowIndex }));
            this.selectedUR.products = this.gridTableService.getAllData(this.productParams);
        }
        else {
            this.selectedUR.budgetCode = event.concatenatedSegments;
            this.selectedUR.budgetCodeId = event.id;
        }
    }

    patchUom(event: any) {
        this.selectedProductNode.data = Object.assign(this.selectedProductNode.data, { uom: event.unitOfMeasure });
        this.productParams.api.applyTransaction({ update: [this.selectedProductNode.data] });
        this.selectedUR.products = this.gridTableService.getAllData(this.productParams);
    }

    validateBeforeSave() {
        this.warning = false;
        if (!this.selectedUR.inventoryGroupId) {
            this.warning = true;
            return this.notify.warn(this.l('CannotBeEmpty', this.l('InventoryGroup')));
        }
        if (!this.selectedUR.currencyId) {
            this.warning = true;
            return this.notify.warn(this.l('CannotBeEmpty', this.l('Currency')));
        }
        let checkDate = moment();
        this.selectedUR.products.forEach(prod => {
            if (!prod.deliveryDate && !this.deliveryDate) {
                this.warning = true;
                return this.notify.warn(this.l('CannotBeEmpty', this.l('DeliveryDate')));
            }
            if ((prod.deliveryDate && moment(prod.deliveryDate) < checkDate) || (this.deliveryDate && moment(this.deliveryDate) <= checkDate)) {
                this.warning = true;
                return this.notify.warn(this.l('DeliveryDateMustBeGreaterThanNow'));
            }
            if (!this.selectedUR.budgetCodeId) {
                this.warning = true;
                return this.notify.warn(this.l('CannotBeEmpty', this.l('BudgetCode')));
            }
            if (!prod.quantity || !Number(prod.quantity) || Number(prod.quantity) <= 0) {
                this.warning = true;
                return this.notify.warn(this.l('IsInvalid', this.l('Quantity')));
            }
        })
        return this.warning;
    }

    createOrEdit() {
        this.validateBeforeSave();
        if (this.warning) return;
        else {
            this.spinnerService.show();
            this.selectedUR.products = this.gridTableService.getAllData(this.productParams);
            this.selectedUR.products.forEach(prod => {
                if (!prod.deliveryDate && this.deliveryDate) prod.deliveryDate = this.deliveryDate;
                if (!prod.currencyId) prod.currencyId = this.selectedUR.originalCurrencyId;
            });
            let body = Object.assign({
                id: this.selectedUR.id,
                userRequestName: this.selectedUR.userRequestName ?? '',
                userRequestNumber: this.selectedUR.userRequestNumber ?? '',
                purchasePurposeId: this.selectedUR.purchasePurposeId ?? undefined,
                expenseDepartmentId: this.selectedUR.expenseDepartmentId ?? undefined,
                documentTypeId: this.selectedUR.documentTypeId ?? undefined,
                requestDate: this.selectedUR.requestDate ?? new Date(),
                requestUserId: abp.session.userId ?? undefined,
                picDepartmentId: this.selectedUR.picDepartmentId ?? '',
                inventoryGroupId: this.selectedUR.inventoryGroupId ?? undefined,
                supplierId: this.selectedUR.supplierId ?? undefined,
                currencyId: this.selectedUR.currencyId ?? undefined,
                totalPrice: this.totalPrice ?? 0,
                originalTotalPrice: this.originalTotalPrice ?? 0,
                originalCurrencyId: this.selectedUR.originalCurrencyId ?? undefined,
                originalCurrencyCode: this.currencies.find(c => c.value == this.selectedUR.originalCurrencyId)?.label ?? '',
                budgetCodeId: this.selectedUR.budgetCodeId ?? undefined,
                note: this.selectedUR.note ?? '',
                documentDate: this.selectedUR.documentDate ?? undefined,
                products: this.selectedUR.products
            });
            this._serviceProxy.createOrEditUserRequest(body)
                .pipe(finalize(() => {
                    this._serviceProxy.getUrDetail(this.selectedUR.id)
                        .pipe(finalize(() => {
                            this.spinnerService.hide();
                            // tạo luôn step phê duyệt
                            // let body = Object.assign(new CreateRequestApprovalInputDto(), {
                            //     reqId: this.selectedUR.id,
                            //     processTypeCode: 'UR'
                            // })

                            // this.spinnerService.show();
                            // this._approvalProxy.createRequestApprovalTree(body)
                            //     .pipe(finalize(() => {
                            //         this.spinnerService.hide();
                            //         this.modalSave.emit(null);
                            //         this.modal.hide();
                            //     }))
                            //     .subscribe(res => this.notify.success(this.l('Successfully')))
                            this.getApprovalInfos();
                        }))
                        .subscribe(res => {
                            this.selectedUR = res;
                            let name = "";
                            if ((this.selectedUR.replyNote ?? "").split(":").length > 1) name = (this.selectedUR.replyNote ?? "").split(":")[0];
                            this.selectedUR.replyNote = (this.selectedUR.replyNote ?? "").slice(name.length >= 1 ? name.length + 1 : 0, (this.selectedUR.replyNote ?? "").length);

                            this.userRequestStorage = res;
                            this.totalPrice = this.formartMoney(this.selectedUR.totalPrice);
                            this.originalTotalPrice = this.formartMoney(this.selectedUR.originalTotalPrice);
                            this.approvalStatus = this.handleStatus(this.selectedUR.approvalStatus);
                        });
                }))
                .subscribe(res => {
                    this.notify.success(this.l('Successfully'));
                    if (this.newAttachments.length > 0) {
                        this.newAttachments.forEach(e => {
                            setTimeout(() => this._http
                                .post<any>(this.uploadUrl, e.file, {
                                    params: {
                                        type: 'UR_Attachments',
                                        serverFileName: e.serverFileName,
                                        headerId: res
                                    }
                                })
                                .pipe(finalize(() => { }))
                                .subscribe(), 50);
                        });
                    }
                })
        }
    }

    cellEditingStopped(params: AgCellEditorParams) {
        if (params?.colDef?.field === 'quantity') {
            if (!params.value || !Number(params.value) || Number(params.value) <= 0) {
                setTimeout(() => this.productParams.api.startEditingCell({ colKey: 'quantity', rowIndex: this.selectedProductNode.rowIndex }));
                return this.notify.warn(this.l('MustGreaterThan', this.l('Quantity'), '0'));
            }
            params.data.quantity = Number(params.value);
            this.selectedUR.products = this.gridTableService.getAllData(this.productParams);
        }
        if (params?.colDef?.field === 'unitPrice') {
            if (!params.value || !Number(params.value) || Number(params.value) <= 0) {
                setTimeout(() => this.productParams.api.startEditingCell({ colKey: 'unitPrice', rowIndex: this.selectedProductNode.rowIndex }));
                return this.notify.warn(this.l('MustGreaterThan', this.l('Price'), '0'));
            }
            params.data.unitPrice = Number(params.value);
            this.selectedUR.products = this.gridTableService.getAllData(this.productParams);
        }
        if (params?.colDef?.field === 'productName') {
            params.data.uom = this.defaultParameter.uom;
            this.selectedUR.products = this.gridTableService.getAllData(this.productParams);
            this.productParams.api.setRowData(this.selectedUR.products);
        }
        this.caculateTotalPrice();
    }

    getAllPurchasePurpose() {
        this.spinnerService.show();
        this.purposes = [];
        this.purposes.unshift({
            label: '',
            value: undefined
        });
        this._cacheProxy.getAllPurchasePurpose()
            .pipe(finalize(() => {
                this.spinnerService.hide();
            }))
            .subscribe(res => res.map(e => this.purposes.push({
                label: e.purchasePurposeName,
                value: e.id
            })));
    }

    getAllExchangeRate() {
        this._cacheProxy.getGlExchangeRate('', '', null)
            .subscribe(res => {
                this.exchangeRates = res;
            })
    }

    getDefaultParameter() {
        this.spinnerService.show();
        this._cacheProxy.getDefaultParameter()
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => {
                this.defaultParameter = res;
            })
    }

    caculateTotalPrice() {
        this.selectedUR.totalPrice = 0;
        this.selectedUR.originalTotalPrice = 0;
        this.productParams?.api.forEachLeafNode((node: RowNode) => {
            if (node.data.quantity && node.data.unitPrice) {
                let cost = node.data.quantity * node.data.unitPrice * this.conversionRate;
                let originalCost = node.data.quantity * node.data.unitPrice;
                this.selectedUR.totalPrice += cost;
                this.selectedUR.originalTotalPrice += originalCost;
            }
        });
        this.totalPrice = this._dataFormatService.moneyFormat(this.selectedUR.totalPrice);
        this.originalTotalPrice = this._dataFormatService.moneyFormat(this.selectedUR.originalTotalPrice);

    }

    handleStatus(status: string) {
            switch (status) {
                case 'NEW':
                    return this.l('New') ;
                case 'INCOMPLETE':
                    return this.l('New') ;
                case 'PENDING':
                    return this.l('') ;
                case 'WAITTING':
                    return this.l('Waitting') ;
                case 'APPROVED':
                    return this.l('Approved') ;
                case 'REJECTED':
                    return this.l('Rejected') ;
                case 'FORWARD':
                    return this.l('Forward') ;
            }
    }

    callBackAttachmentsGrid(params: GridParams) {
        this.attachmentsParams = params;
    }

    onChangeAttachmentSelection(params: any) {
        let selectedNode = params.api?.getSelectedNodes()[0];
        if (this.selectedProduct) this.selectedAttachmentNode = selectedNode;
        this.selectedAttachment = params.api?.getSelectedRows()[0] ?? new GetAllUserRequestAttachmentsForViewDto();
    }

    dowloadAttachment(isCell: boolean, gridParams: any) {
        if (isCell) {
            this.spinnerService.show();
            this._http
                .get(this.downloadUrl, { params: { 'filename': gridParams.data?.serverFileName, 'rootPath': gridParams.data?.rootPath }, responseType: 'blob' })
                .pipe(finalize(() => this.spinnerService.hide()))
                .subscribe(blob => {
                    if (blob == null) this.notify.warn(this.l('AttachmentIsNotExist'));
                    else FileSaver.saveAs(blob, gridParams.data.fileName)
                }, err => this.notify.warn(this.l('AttachmentIsNotExist')));
        }
        else {
            this.selectedUR.attachments.forEach(file => {
                this._http
                    .get(this.downloadUrl, { params: { 'filename': file.serverFileName, 'rootPath': file.rootPath }, responseType: 'blob' })
                    .pipe(finalize(() => this.spinnerService.hide()))
                    .subscribe(blob => {
                        if (blob == null) this.notify.warn(this.l('AttachmentIsNotExist'));
                        else FileSaver.saveAs(blob, file.fileName);
                    }, err => this.notify.warn(this.l('AttachmentIsNotExist')));
            })
        }
    }

    deleteFileRow() {
        if (this.selectedAttachmentNode.data?.id) {
            this.message.confirm(this.l('AreYouSure'), this.l('DeleteThisSelection'), (isConfirmed) => {
                if (isConfirmed) {
                    this.spinnerService.show();
                    this.attachmentsParams?.api.applyTransaction({ remove: [this.selectedAttachmentNode.data] });
                    this._fileApi.deleteAttachFile(this.selectedAttachmentNode.data?.id)
                        .pipe(finalize(() => this.spinnerService.hide()))
                        .subscribe(res => {
                            this._http
                                .get(this.removeUrl, {
                                    params: { "attachFile": this.selectedAttachmentNode.data?.serverFileName, "rootPath": this.selectedAttachmentNode.data?.rootPath }, responseType: 'blob'
                                })
                                .subscribe(res => this.notify.success(this.l('SuccessfullyDeleted')));
                        });
                    this.selectedUR.attachments = [];
                    this.selectedUR.attachments = this.gridTableService.getAllData(this.attachmentsParams);
                }
            })
        }
        else {
            this.attachmentsParams?.api.applyTransaction({ remove: [this.selectedAttachmentNode.data] });
            this.selectedUR.attachments = [];
            this.selectedUR.attachments = this.gridTableService.getAllData(this.attachmentsParams);
        }
    }

    uploadFiles() {
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

    reset() {
        setTimeout(() => {
            this.InputVar.nativeElement.value = "";
            this.fileName = '';
            this.InputVar.nativeElement.click();
        }, 50);
    }

    onUpload(files: Array<any>): void {
        if (files.length > 0) {
            files.forEach(f => {
                let formData: FormData = new FormData();
                let serverName = 'UR_' + Date.now().toString() + '_' + f.name;
                formData.append('file', f);
                this.selectedUR.attachments.push(Object.assign({
                    file: formData,
                    fileName: f.name,
                    serverFileName: serverName,
                    uploadTime: new Date(),
                }));

                this.newAttachments.push(Object.assign({
                    file: formData,
                    fileName: f.name,
                    serverFileName: serverName,
                    uploadTime: new Date(),
                }));
            })
            this.attachmentsParams.api?.setRowData(this.selectedUR.attachments);
        }
    }

    changeDocumentDate(event: any) {
        if (this.selectedUR.id && this.selectedUR.originalCurrencyId != this.defaultParameter.curencyId) {
            let fromCurrency = this.currencies.find(e => e.value == this.selectedUR.originalCurrencyId)?.label;

            this._cacheProxy.getGlExchangeRate(fromCurrency, 'VND', event)
                .pipe(finalize(() => {

                }))
                .subscribe(res => {
                    if (res.length < 1) this.notify.warn(this.l('ExchangeDataIsNotExist'));
                    else {
                        this.conversionRate = res[0].conversionRate;
                        this.caculateTotalPrice();
                    }
                });
        }
    }

    getExchangeRate() {
        if (this.selectedUR.originalCurrencyId != this.defaultParameter.curencyId) {
            let fromCurrency = this.currencies.find(e => e.value == this.selectedUR.originalCurrencyId)?.label;

            this._cacheProxy.getGlExchangeRate(fromCurrency, 'VND', this.selectedUR.documentDate)
                .pipe(finalize(() => {

                }))
                .subscribe(res => {
                    this.conversionRate = res[0].conversionRate;
                });
        }
    }
}
