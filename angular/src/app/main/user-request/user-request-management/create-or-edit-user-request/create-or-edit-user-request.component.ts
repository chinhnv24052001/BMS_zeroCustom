import { HttpClient } from '@angular/common/http';
import { CommonGeneralCacheServiceProxy, CreateOrEditUserRequestInputDto, GetAllProductsForViewDto, GetRequesterInfoForViewDto, CommonAllGlCodeCombination, CommonAllSupplier, CommonGetGlExchangeRateDto, CommonDefaultParameterDto, CreateRequestApprovalInputDto, RequestApprovalTreeServiceProxy } from './../../../../../shared/service-proxies/service-proxies';
import { UrUserRequestManagementServiceProxy, MstUnitOfMeasureServiceProxy } from '@shared/service-proxies/service-proxies';
import { TmssSelectGridModalComponent } from './../../../../shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from './../../../../shared/models/base.model';
import { AppComponentBase } from 'shared/common/app-component-base';
import { Component, ElementRef, Injector, ViewChild } from '@angular/core';
import { ICellEditorParams, RowNode, ValueFormatterParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { finalize } from 'rxjs/operators';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { TABS } from '@app/shared/constants/tab-keys';
import { EventBusService } from '@app/shared/services/event-bus.service';
import * as moment from 'moment';
import { AppConsts } from '@shared/AppConsts';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';

@Component({
    selector: 'create-or-edit-user-request',
    templateUrl: './create-or-edit-user-request.component.html',
    styleUrls: ['./create-or-edit-user-request.component.less']
})
export class CreateOrEditUserRequestComponent extends AppComponentBase {
    @ViewChild('selectProductModal', { static: true }) selectProductModal!: TmssSelectGridModalComponent;
    @ViewChild('selectBudgetCodeModal', { static: true }) selectBudgetCodeModal!: TmssSelectGridModalComponent;
    @ViewChild('selectBudgetCodeHeadModal', { static: true }) selectBudgetCodeHeadModal!: TmssSelectGridModalComponent;
    @ViewChild('selectUomModal', { static: true }) selectUomModal!: TmssSelectGridModalComponent;
    @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
    @ViewChild('viewDetailApprove', { static: true }) viewDetailApprove: ViewListApproveDetailComponent;


    uploadUrl: string = AppConsts.remoteServiceBaseUrl + '/AttachFile/UploadFileToFolder';
    uploadData = [];
    fileName: string = '';
    formData: FormData = new FormData();
    processInfo: any[] = [];
    urlBase: string = AppConsts.remoteServiceBaseUrl;
    uploadDataParams: GridParams;
    selectedFileNode: RowNode;

    urColDefs: CustomColDef[] = [];
    budgetCodeColDefs: CustomColDef[] = [];
    productColDefs: CustomColDef[] = [];
    attachmentsColDefs: CustomColDef[] = [];
    uomColDefs: CustomColDef[] = [];
    defaultColDef = {
        suppressMenu: true,
    };
    urDParams: GridParams;

    frameworkComponents: any;
    selectedProductNode: RowNode;

    productOnCart: GetAllProductsForViewDto[] = [];

    userRequest: CreateOrEditUserRequestInputDto = new CreateOrEditUserRequestInputDto();
    userName: string = '';
    userTitle: string = '';

    urStatuses: { label: string, value: number }[] = [
        { label: this.l('New'), value: 0 },
        { label: this.l('Pending'), value: 1 },
        { label: this.l('Approved'), value: 2 },
        { label: this.l('Rejected'), value: 3 },
    ];

    processTypes: { label: string, value: number }[] = [];
    glCodes: { label: string, value: number }[] = [];

    currencies: { label: string, value: number | undefined }[] = [];
    inventoryGroups: { label: string, value: number | undefined }[] = [];
    suppliers: { label: string, value: number | undefined }[] = [];
    purposes: { label: string, value: number | undefined }[] = [];
    documentTypes: { label: string, value: number | undefined }[] = [
        { label: 'User Request', value: undefined }
    ];
    uomList: any[] = [];
    requester: GetRequesterInfoForViewDto = new GetRequesterInfoForViewDto();
    totalPrice: string = '0';
    inventoryGroupId: number | undefined;
    requestDate = new Date();
    inventoryGroupIdStorage: number | undefined;
    currencyIdStorage: number | undefined;
    urStatus: number = 0;
    processTypeId: number = 1;
    warning: boolean = false;
    excelFileUpload: any;
    deliveryDate: any;
    budgetCodeDefault: string = '';
    bugetCodeIdDefault: number | undefined;
    budgetCode: string = '';
    exchangeRates: CommonGetGlExchangeRateDto[] = [];
    documentDate: any;
    conversionRate: number = 1;
    defaultParameter: CommonDefaultParameterDto = new CommonDefaultParameterDto();
    requestId: number = undefined;

    constructor(
        injector: Injector,
        private _serviceProxy: UrUserRequestManagementServiceProxy,
        private _cacheProxy: CommonGeneralCacheServiceProxy,
        private _dataFormatService: DataFormatService,
        private gridTableService: GridTableService,
        private eventBus: EventBusService,
        private _http: HttpClient,
        private _approvalProxy: RequestApprovalTreeServiceProxy,
        private _uomProxy: MstUnitOfMeasureServiceProxy
    ) {
        super(injector);
        this.frameworkComponents = {
            agDatepickerRendererComponent: AgDatepickerRendererComponent,
            agDropdownRendererComponent: AgDropdownRendererComponent,
        };
        this.urColDefs = [
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
                width: 150
            },
            {
                headerName: this.l('ProductName'),
                headerTooltip: this.l('ProductName'),
                cellClass: ['text-left', 'cell-clickable'],
                field: 'productName',
                editable: (params) => params.data.productCode ? false : true,
                width: 300
            },
            {
                headerName: this.l('SupplierName'),
                headerTooltip: this.l('SupplierName'),
                cellClass: ['text-left', 'cell-clickable'],
                field: 'supplierName',
                width: 200
            },
            {
                headerName: this.l('Quantity'),
                headerTooltip: this.l('Quantity'),
                cellClass: ['text-right', 'cell-clickable'],
                field: 'quantity',
                editable: true,
                width: 90
            },
            {
                headerName: this.l('Uom'),
                headerTooltip: this.l('Uom'),
                cellClass: ['text-center', 'cell-clickable'],
                field: 'uom',
                editable: (params) => params.data.productCode ? false : true,
                width: 100
            },
            {
                headerName: this.l('Price'),
                headerTooltip: this.l('Price'),
                cellClass: ['text-right', 'cell-clickable'],
                field: 'unitPrice',
                editable: (params) => params.data.productCode && params.data?.unitPrice > 0 ? false : true,
                valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.moneyFormat(params.value),
                width: 100
            },
            {
                headerName: this.l('ExchangeUnitPrice'),
                headerTooltip: this.l('ExchangeUnitPrice'),
                cellClass: ['text-right'],
                field: 'exchangeUnitPrice',
                valueGetter: (params: ValueGetterParams) => params.data ? Number(params.data.unitPrice * (this.conversionRate ?? 1)) : 0,
                valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.moneyFormat(params.value),
                width: 120
            },
            {
                headerName: this.l('TotalPrice'),
                headerTooltip: this.l('TotalPrice'),
                cellClass: ['text-right'],
                valueGetter: (params: ValueGetterParams) => params.data ? Number(params.data.quantity * params.data.unitPrice * (this.conversionRate ?? 1)) : 0,
                valueFormatter: (params: ValueFormatterParams) => this._dataFormatService.moneyFormat(params.value),
                width: 120
            },
            {
                headerName: this.l('DeliveryDate'),
                headerTooltip: this.l('DeliveryDate'),
                cellClass: ['text-left', 'cell-clickable'],
                field: 'deliveryDate',
                editable: true,
                cellRenderer: 'agDatepickerRendererComponent',
                valueGetter: params => this._dataFormatService.dateTimeFormat(params.data.doingDate),
                width: 200
            },
            {
                headerName: this.l('BudgetCode'),
                headerTooltip: this.l('BudgetCode'),
                cellClass: ['text-left', 'cell-clickable'],
                field: 'budgetCode',
                rowDrag: true,
                editable: true,
                width: 150
            },
            // {
            //     headerName: this.l('MonthN'),
            //     headerTooltip: this.l('MonthN'),
            //     cellClass: ['text-right', 'cell-clickable'],
            //     field: 'monthN',
            //     editable: true,
            //     width: 90
            // },
            {
                headerName: this.l('N1'),
                headerTooltip: this.l('MonthN1'),
                cellClass: ['text-right', 'cell-clickable'],
                field: 'monthN1',
                editable: true,
                width: 90
            },
            {
                headerName: this.l('N2'),
                headerTooltip: this.l('MonthN2'),
                cellClass: ['text-right', 'cell-clickable'],
                field: 'monthN2',
                editable: true,
                width: 90
            },
            {
                headerName: this.l('N3'),
                headerTooltip: this.l('MonthN3'),
                cellClass: ['text-right', 'cell-clickable'],
                field: 'monthN3',
                editable: true,
                width: 90
            },
        ];

        this.productColDefs = [
            {
                headerName: this.l('ProductCode'),
                headerTooltip: this.l('ProductCode'),
                cellClass: ['text-left'],
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
                cellClass: ['text-right'],
                field: 'unitPrice',
                // valueGetter: (params: ValueGetterParams) => params.data?.unitPrice ? params.data.unitPrice : 0,
                valueFormatter: (params: ValueFormatterParams) => params.value > 0 ? this._dataFormatService.moneyFormat(params.value) : params.value,
                flex: 0.3
            },
            {
                headerName: this.l('SupplierName'),
                headerTooltip: this.l('SupplierName'),
                cellClass: ['text-left'],
                field: 'supplierName',
                flex: 0.6
            },
        ];

        this.budgetCodeColDefs = [
            {
                headerName: this.l('BudgetCode'),
                headerTooltip: this.l('BudgetCode'),
                cellClass: ['text-left'],
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
                flex: 0.3
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
            }
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
        this.documentDate = new Date();
        this.getAllInventoryGroup();
        this.getAllCurrency();
        // this.getAllSupplier();
        this.getRequesterInfo();
        this.getAllPurchasePurpose();
        this.getAllProcessType();
        this.getDefaultGlCode();
        this.getAllExchangeRate();
        this.getDefaultParameter();
        this.getAllUom();
        this.inventoryGroupIdStorage = undefined;
        this.currencyIdStorage = undefined;
        this.requestId = undefined;
    }

    callBackDetailsGrid(params: GridParams) {
        this.urDParams = params;
        this.addRow();
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

    addRow() {
        this.urDParams?.api.stopEditing();
        let breakForEach: boolean = false;
        let checkDate = moment();
        this.urDParams?.api?.forEachLeafNode((node: RowNode) => {
            if (!breakForEach && (!Number(node.data.quantity) || Number(node.data.quantity) < 0 && ((!node.data.productCode) || (!node.data.productName)))) {
                breakForEach = true;
                setTimeout(() => this.urDParams.api.startEditingCell({ colKey: 'productCode', rowIndex: node.rowIndex }));
                return this.notify.warn(this.l('LineIsEmpty', node.rowIndex + 1));
            }
            if (!breakForEach && (moment(node.data.deliveryDate) < checkDate)) {
                breakForEach = true;
                setTimeout(() => this.urDParams.api.startEditingCell({ colKey: 'deliveryDate', rowIndex: node.rowIndex }));
                return this.notify.warn(this.l('DeliveryDateMustBeGreaterThanNow'));
            }
        });
        if (breakForEach) return true;
        else {
            this.urDParams?.api.applyTransaction({ add: [{}] });
            const rowIndex = this.urDParams.api.getDisplayedRowCount() - 1;
            setTimeout(() => {
                this.urDParams.api.startEditingCell({ colKey: 'productCode', rowIndex });
                this.selectedProductNode = this.urDParams.api.getRowNode(`${rowIndex}`);
                this.urDParams.api.getRowNode(`${rowIndex}`).setSelected(true);
            });
        }
    }

    deleteRow() {
        this.urDParams?.api.applyTransaction({ remove: [this.selectedProductNode.data] });
        this.productOnCart = [];
        this.productOnCart = this.gridTableService.getAllData(this.urDParams);
        this.caculateTotalPrice();
    }

    agKeyUp(event: KeyboardEvent) {
        event.stopPropagation();
        if (event.key === 'ArrowDown') this.addRow();
    }

    getAllProducts(productCode: string, paginationParams: PaginationParamsModel) {
        return this._serviceProxy.getAllProducts(
            this.userRequest.inventoryGroupId ?? undefined,
            productCode ?? '',
            this.userRequest.originalCurrencyId ?? undefined,
            paginationParams ? paginationParams.sorting : '',
            paginationParams ? paginationParams.pageSize : 20,
            paginationParams ? paginationParams.skipCount : 0
        );
    }

    getAllInventoryGroup() {
        this.spinnerService.show();
        this.inventoryGroups = [];
        this.inventoryGroups.unshift({
            label: '',
            value: undefined
        });
        this._cacheProxy.getAllInventoryGroups()
            .pipe(finalize(() => this.spinnerService.hide()))
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
            }))
            .subscribe(res =>
                res.map(e => this.currencies.push({
                    label: e.currencyCode,
                    value: e.id
                }))
            )
    }

    getDefaultParameter() {
        this.spinnerService.show();
        this._cacheProxy.getDefaultParameter()
        .pipe(finalize(() => this.spinnerService.hide()))
        .subscribe(res => {
            this.defaultParameter = res;
            this.userRequest.originalCurrencyId = this.defaultParameter.curencyId;
            this.userRequest.currencyId = this.defaultParameter.curencyId;
        })
    }

    getRequesterInfo() {
        this.spinnerService.show();
        this.requester = new GetRequesterInfoForViewDto();
        this._serviceProxy.getRequesterInfo(abp.session.userId)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => {
                this.requester = res;
            });
    }

    getAllPurchasePurpose() {
        this.spinnerService.show();
        this.purposes = [];
        this.purposes.unshift({
            label: '',
            value: undefined
        });
        this._cacheProxy.getAllPurchasePurpose()
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => res.map(e => this.purposes.push({
                label: e.purchasePurposeName,
                value: e.id
            })));
    }

    getAllGlCode(budgetCode: string, paginationParams: PaginationParamsModel) {
        return this._cacheProxy.getAllGlCodeCombinations(
            budgetCode ?? '',
            paginationParams ? paginationParams.sorting : '',
            paginationParams ? paginationParams.pageSize : 20,
            paginationParams ? paginationParams.skipCount : 0
        );
    }

    getDefaultGlCode() {
        this.spinnerService.show();
        this.budgetCodeDefault = '';
        this._cacheProxy.getGlCombaination()
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe((res) => {
                this.budgetCodeDefault = res.concatenatedSegments;
                this.bugetCodeIdDefault = res.id;
            });
    }

    getAllProcessType() {
        this.spinnerService.show();
        this.processTypes = [];
        this.processTypes.unshift({
            label: '',
            value: undefined
        });
        this._cacheProxy.getAllProcessType()
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => res.map(e => this.processTypes.push({
                label: e.processTypeName,
                value: e.id
            })));
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

    patchProduct(event: GetAllProductsForViewDto) {
        if (!event || !event.inventoryItemId) {
            this.selectedProductNode.data = Object.assign(new GetAllProductsForViewDto());
            this.urDParams.api.applyTransaction({ update: [this.selectedProductNode.data] });
            setTimeout(() => this.urDParams.api.startEditingCell({ colKey: 'productCode', rowIndex: this.selectedProductNode.rowIndex }));
            this.productOnCart = this.gridTableService.getAllData(this.urDParams);
            return this.notify.warn(this.l('CannotFind', this.l('Product')));
        }
        if (this.productOnCart.some((e, index) => e.productCode === event.productCode && this.selectedProductNode.rowIndex !== index)) {
            setTimeout(() => this.urDParams.api.startEditingCell({ colKey: 'productCode', rowIndex: this.selectedProductNode.rowIndex }));
            return this.notify.warn(this.l('IsAlreadyExisted', this.l('Product')));
        }
        // this.userRequest.budgetCodeId = this.bugetCodeIdDefault;
        // this.budgetCode = this.budgetCodeDefault;
        this.selectedProductNode.data = Object.assign(new GetAllProductsForViewDto(), event, { productCode: event.color ? event.productCode + '.' + event.color : event.productCode, quantity: 1, uom: event.uom });
        this.urDParams.api.applyTransaction({ update: [this.selectedProductNode.data] });
        setTimeout(() => this.urDParams.api.startEditingCell({ colKey: 'quantity', rowIndex: this.selectedProductNode.rowIndex }));
        this.productOnCart = this.gridTableService.getAllData(this.urDParams);
    }

    patchBudgetCode(event: CommonAllGlCodeCombination, isGrid: boolean) {
        if (isGrid) {
            if (!event || !event.id) {
                setTimeout(() => this.urDParams.api.startEditingCell({ colKey: 'budgetCode', rowIndex: this.selectedProductNode.rowIndex }));
                this.productOnCart = this.gridTableService.getAllData(this.urDParams);
                return this.notify.warn(this.l('CannotFind', this.l('BudgetCode')));
            }
            this.selectedProductNode.data = Object.assign(this.selectedProductNode.data, { budgetCode: event.concatenatedSegments, budgetCodeId: event.id });
            this.urDParams.api.applyTransaction({ update: [this.selectedProductNode.data] });
            this.productOnCart = this.gridTableService.getAllData(this.urDParams);
        }
        else {
            this.userRequest.budgetCodeId = event.id;
            this.budgetCode = event.concatenatedSegments;
        }
    }

    patchUom(event: any) {
        this.selectedProductNode.data = Object.assign(this.selectedProductNode.data, { uom: event.unitOfMeasure });
        this.urDParams.api.applyTransaction({ update: [this.selectedProductNode.data] });
        this.productOnCart = this.gridTableService.getAllData(this.urDParams);
    }

    validateBeforeSave() {
        this.warning = false;
        if (!this.userRequest.inventoryGroupId) {
            this.warning = true;
            return this.notify.warn(this.l('CannotBeEmpty', this.l('InventoryGroup')));
        }
        if (!this.userRequest.originalCurrencyId) {
            this.warning = true;
            return this.notify.warn(this.l('CannotBeEmpty', this.l('Currency')));
        }
        if (!this.userRequest.budgetCodeId) {
            this.warning = true;
            return this.notify.warn(this.l('CannotBeEmpty', this.l('BudgetCode')));
        }
        let checkDate = moment();
        this.productOnCart.forEach(prod => {
            if (!prod.deliveryDate && !this.deliveryDate) {
                this.warning = true;
                return this.notify.warn(this.l('CannotBeEmpty', this.l('DeliveryDate')));
            }
            if ((prod.deliveryDate && moment(prod.deliveryDate) <= checkDate) || (this.deliveryDate && moment(this.deliveryDate) <= checkDate)) {
                this.warning = true;
                return this.notify.warn(this.l('DeliveryDateMustBeGreaterThanNow'));
            }
            if (!prod.quantity || !Number(prod.quantity) || Number(prod.quantity) <= 0) {
                this.warning = true;
                return this.notify.warn(this.l('IsInvalid', this.l('Quantity')));
            }
            if (!prod.unitPrice || !Number(prod.unitPrice) || Number(prod.unitPrice) <= 0) {
                this.warning = true;
                return this.notify.warn(this.l('IsInvalid', this.l('UnitPrice')));
            }
        });
        return this.warning;
    }

    createOrEdit() {
        this.validateBeforeSave();
        if (this.warning) return;
        else {
            this.spinnerService.show();
            this.productOnCart = [];
            this.productOnCart = this.gridTableService.getAllData(this.urDParams);
            this.productOnCart.forEach(prod => {
                if (!prod.deliveryDate && this.deliveryDate) prod.deliveryDate = this.deliveryDate;
            });
            let body = Object.assign({
                userRequestName: this.userRequest.userRequestName ?? '',
                purchasePurposeId: this.userRequest.purchasePurposeId ?? undefined,
                expenseDepartmentId: this.userRequest.expenseDepartmentId ?? undefined,
                documentTypeId: this.userRequest.documentTypeId ?? undefined,
                requestDate: this.requestDate ?? new Date(),
                requestUserId: abp.session.userId ?? undefined,
                picDepartmentId: this.productOnCart[0].picDepartmentId ?? '',
                inventoryGroupId: this.userRequest.inventoryGroupId ?? undefined,
                supplierId: this.userRequest.supplierId ?? undefined,
                currencyId: this.userRequest.currencyId ?? undefined,
                originalCurrencyId: this.userRequest.originalCurrencyId ?? undefined,
                totalPrice: this.totalPrice ?? 0,
                originalTotalPrice: this.userRequest.originalTotalPrice ?? 0,
                budgetCodeId: this.userRequest.budgetCodeId ?? undefined,
                originalCurrencyCode: this.currencies.find(c => c.value == this.userRequest.originalCurrencyId)?.label ?? '',
                documentDate: this.documentDate ?? undefined,
                note: this.userRequest.note ?? '',
                products: this.productOnCart
            });
            this._serviceProxy.createOrEditUserRequest(body)
                .pipe(finalize(() => {
                    // this.openUrMgmt();
                    this.spinnerService.hide();
                    let body = Object.assign(new CreateRequestApprovalInputDto(), {
                        reqId: this.requestId ,
                        processTypeCode: 'UR'
                    })

                    this.spinnerService.show();
                    this._approvalProxy.createRequestApprovalTree(body)
                        .pipe(finalize(() => {
                            this.spinnerService.hide();

                        }))
                        .subscribe(res => this.notify.success(this.l('Successfully')))
                }))
                .subscribe(res => {
                    this.notify.success(this.l('Successfully'));
                    this.requestId = res;
                    if (this.uploadData.length > 0) {
                        this.uploadData.forEach(e => {
                            this._http
                                .post<any>(this.uploadUrl, e.file, {
                                    params: {
                                        type: 'UR_Attachments',
                                        serverFileName: e.serverFileName,
                                        headerId: res
                                    }
                                })
                                // .pipe(finalize(() => this.refreshFile()))
                                .subscribe();
                        });
                    }
                })
        }
    }

    openUrMgmt() {
        this.refresh();
        this.eventBus.emit({
            type: 'openComponent',
            functionCode: TABS.UR_REQUEST,
            tabHeader: this.l('ManageUserRequest'),
            params: {
                key: 1
            }
        });
    }

    refresh() {
        this.userRequest = new CreateOrEditUserRequestInputDto();
        this.productOnCart = [];
        this.totalPrice = '0';
        this.userRequest.originalCurrencyId = this.defaultParameter.curencyId;
        this.userRequest.currencyId = this.defaultParameter.curencyId;
        this.documentDate = new Date();
        this.requestId = undefined;
        this.budgetCode = '';
        this.urDParams.api?.setRowData(this.productOnCart);
        this.warning = false;
        this.conversionRate = 1;
        this.refreshFile();
        this.addRow();
    }

    onChangeProductSelection(params: any) {
        const selectedNode = params.api.getSelectedNodes()[0];
        if (selectedNode) this.selectedProductNode = selectedNode;
    }

    cellEditingStopped(params: AgCellEditorParams) {
        if (params?.colDef?.field === 'quantity') {
            if (!params.value || !Number(params.value) || Number(params.value) <= 0) {
                setTimeout(() => this.urDParams.api.startEditingCell({ colKey: 'quantity', rowIndex: this.selectedProductNode.rowIndex }));
                return this.notify.warn(this.l('MustGreaterThan', this.l('Quantity'), '0'));
            }
            params.data.quantity = Number(params.value);
            this.productOnCart = this.gridTableService.getAllData(this.urDParams);
        }
        if (params?.colDef?.field === 'unitPrice') {
            if (!params.value || !Number(params.value) || Number(params.value) <= 0) {
                setTimeout(() => this.urDParams.api.startEditingCell({ colKey: 'unitPrice', rowIndex: this.selectedProductNode.rowIndex }));
                return this.notify.warn(this.l('MustGreaterThan', this.l('Price'), '0'));
            }
            params.data.unitPrice = Number(params.value);
            this.productOnCart = this.gridTableService.getAllData(this.urDParams);
        }
        if (params?.colDef?.field === 'productName') {
            params.data.uom = this.defaultParameter.uom;
            this.productOnCart = this.gridTableService.getAllData(this.urDParams);
            this.urDParams.api.setRowData(this.productOnCart);
        }
        this.caculateTotalPrice();
    }

    onChangeInventoryGroup(params: any) {
        if (this.productOnCart.length > 0) {
            this.message.confirm(this.l('AreYouSure'), this.l('ChangeInventoryGroupWillRefreshAllData'), (isConfirmed) => {
                if (isConfirmed) {
                    this.refresh();
                    this.inventoryGroupIdStorage = params;
                    this.userRequest.inventoryGroupId = params;
                }
                else {
                    this.userRequest.inventoryGroupId = this.inventoryGroupIdStorage;
                }
            })
        }
    }

    getAllExchangeRate() {
        this._cacheProxy.getGlExchangeRate('', '', null)
            .subscribe(res => {
                this.exchangeRates = res;
            })
    }

    caculateTotalPrice() {
        if (this.productOnCart.length > 0) {
            this.userRequest.totalPrice = 0;
            this.userRequest.originalTotalPrice = 0;
            this.urDParams?.api.forEachLeafNode((node: RowNode) => {
                let cost = node.data.quantity * node.data.unitPrice * this.conversionRate;
                let originalCost = node.data.quantity * node.data.unitPrice;
                this.userRequest.totalPrice += cost;
                this.userRequest.originalTotalPrice += originalCost;
            });
            this.totalPrice = this._dataFormatService.moneyFormat(this.userRequest.totalPrice);
        }
    }

    moneyFormat(params: number) {
        return this._dataFormatService.moneyFormat(params);
    }

    reset() {
        setTimeout(() => {
            this.InputVar.nativeElement.value = "";
            this.fileName = '';
            this.InputVar.nativeElement.click();
        }, 50);
    }

    onUpload(files: Array<any>): void {
        // this.uploadData = [];
        if (files.length > 0) {
            files.forEach(f => {
                let formData: FormData = new FormData();
                let serverName = 'UR_' + Date.now().toString() + '_' + f.name;
                formData.append('file', f);
                this.uploadData.push(Object.assign({
                    file: formData,
                    fileName: f.name,
                    serverFileName: serverName,
                    uploadTime: new Date()
                }))
            })
            this.uploadDataParams.api?.setRowData(this.uploadData);
        }
    }

    callBackFileGrid(params: GridParams) {
        this.uploadDataParams = params;
    }

    onChangeFileSelection(params: any) {
        const selectedNode = params.api.getSelectedNodes()[0];
        if (selectedNode) this.selectedFileNode = selectedNode;
    }

    deleteFile() {
        this.uploadDataParams?.api.applyTransaction({ remove: [this.selectedFileNode.data] });
        this.uploadData = [];
        this.uploadData = this.gridTableService.getAllData(this.uploadDataParams);
    }

    refreshFile() {
        this.uploadData = [];
        this.uploadDataParams.api?.setRowData([]);
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

    changeDocumentDate(event: any) {
        if (this.userRequest.originalCurrencyId != this.defaultParameter.curencyId) {
            let fromCurrency = this.currencies.find(e => e.value == this.userRequest.originalCurrencyId)?.label;

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

    changeCurrency(event: any) {
        if (this.productOnCart.length > 0) {
            this.message.confirm(this.l('AreYouSure'), this.l('ChangeInventoryGroupWillRefreshAllData'), (isConfirmed) => {
                if (isConfirmed) {
                    this.refresh();
                    this.currencyIdStorage = event;
                    this.userRequest.originalCurrencyId = event;
                    this.changeDocumentDate(this.documentDate);
                }
                else {
                    this.userRequest.originalCurrencyId = this.currencyIdStorage;
                }
            })
        }
        else {
            this.changeDocumentDate(this.documentDate);
        }
    }

    sendRequest() {
        if (!this.requestId) {
            this.notify.warn(this.l('UserRequestHasNotBeenSaved'))
            return;
        }
        else {
            this.viewDetailApprove.showModal(this.requestId, 'UR');
            // let body = Object.assign(new CreateRequestApprovalInputDto(), {
            //     reqId: this.requestId,
            //     processTypeCode: 'UR'
            // })

            // this.spinnerService.show();
            // this._approvalProxy.createRequestApprovalTree(body)
            //     .pipe(finalize(() => {
            //         this.spinnerService.hide();
            //     }))
            //     .subscribe(res => this.notify.success(this.l('Successfully')));
        }
    }
}
