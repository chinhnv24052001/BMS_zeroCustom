import { ICellEditorParams, ICellRendererParams, RowNode, ValueFormatterParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgCellButtonRendererComponent } from '@app/shared/common/grid-input-types/ag-cell-button-renderer/ag-cell-button-renderer.component';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { PaginationParamsModel, CustomColDef, GridParams, AgCellEditorParams } from '@app/shared/models/base.model';
import { AgDataValidateService } from '@app/shared/services/ag-data-validate.service';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, CommonGetGlExchangeRateDto, CommonLookupServiceProxy, CreateRequestApprovalInputDto, GetAllPurchaseOrdersAttachmentsForViewDto, GetPoHeadersForEditDto, InputPurchaseOrdersHeadersDto, MstCategoriesServiceProxy, MstInventoryGroupServiceProxy, MstInventoryItemsServiceProxy, MstLineTypeServiceProxy, MstLocationsServiceProxy, MstOrganizationsServiceProxy, MstPeriodServiceProxy, MstSupplierServiceProxy, MstUnitOfMeasureServiceProxy, PurchaseOrdersServiceProxy, PurchaseRequestServiceProxy, RequestApprovalServiceProxy, RequestApprovalTreeServiceProxy, UrUserRequestManagementServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import * as FileSaver from 'file-saver';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { PurchaseOrdersShipmentsComponent } from '../purchase-orders-shipments/purchase-orders-shipments.component';
import { PurchaseOrderTermsModalComponent } from '../purchase-order-terms-modal/purchase-order-terms-modal.component';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';

@Component({
  selector: 'view-detail-purchase-orders',
  templateUrl: './view-detail-purchase-orders.component.html',
  styleUrls: ['./view-detail-purchase-orders.component.less']
})
export class ViewDetailPurchaseOrdersComponent extends AppComponentBase implements OnInit {

  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @Output() close = new EventEmitter<any>();
  @ViewChild('listCategory', { static: true }) listCategory!: TmssSelectGridModalComponent;
  @ViewChild('listInventoryItems', { static: true }) listInventoryItems!: TmssSelectGridModalComponent;
  @ViewChild('listUOM', { static: true }) listUOM!: TmssSelectGridModalComponent;
  @ViewChild('listLocation', { static: true }) listLocation!: TmssSelectGridModalComponent;
  @ViewChild('listRequester', { static: true }) listRequester!: TmssSelectGridModalComponent;
  @ViewChild('poShipments', { static: true }) poShipments!: PurchaseOrdersShipmentsComponent;
  @ViewChild('listBuyer', { static: true }) listBuyer!: TmssSelectGridModalComponent;
  @ViewChild('listSupplierPopup', { static: true }) listSupplierPopup!: TmssSelectGridModalComponent;
  @ViewChild('listLocationBill', { static: true }) listLocationBill!: TmssSelectGridModalComponent;
  @ViewChild('listLocationShip', { static: true }) listLocationShip!: TmssSelectGridModalComponent;
  @ViewChild('selectChargeAccount', { static: true }) selectChargeAccount: TmssSelectGridModalComponent;
  @ViewChild('selectBudgetCodeHeadModal', { static: true }) selectBudgetCodeHeadModal: TmssSelectGridModalComponent;
  @ViewChild('poTerms', { static: true }) poTerms!: PurchaseOrderTermsModalComponent;
  @ViewChild('viewDetailApprove', { static: true }) viewDetailApprove: ViewListApproveDetailComponent;
  @Output() approveEvent: EventEmitter<any> = new EventEmitter();
  @Output() rejectEvent: EventEmitter<any> = new EventEmitter();
  @Output() requestMoreInfoEvent: EventEmitter<any> = new EventEmitter();
  @Output() forwardEvent: EventEmitter<any> = new EventEmitter();

  @Input() viewOnly = false;
  @Input() hasRequestInfo = false;
  isRequired = false;
  createOrEditForm: FormGroup;
  listInventoryGroups: { label: string, value: string | number }[] = [];
  listSuppliers: { label: string, value: string | number }[] = [];
  listOrganization: { label: string, value: string | number }[] = [];
  listLineTypes: { label: string, value: string | number }[] = [];
  listDestinationType: { label: string, value: string | number }[] = [];
  listCurrency: { label: string, value: string | number }[] = [];
  listPurchasePurpose: { label: string, value: string | number }[] = [];
  listLocations: { label: string, value: string | number }[] = [];
  listSites: { label: string, value: string | number }[] = [];
  listSupplierContacts: { label: string, value: string | number }[] = [];
  listUsers: { label: string, value: string | number }[] = [];
  listLookupCode: { label: string, value: string | number }[] = [];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridColDefDetail: CustomColDef[];
  supplierDefs: CustomColDef[];
  categoryDefs: CustomColDef[];
  siteDefs: CustomColDef[];
  locationDefs: CustomColDef[];
  requestersDefs: CustomColDef[];
  inventoryItemsDefs: CustomColDef[];
  uomItemsDefs: CustomColDef[];
  attachmentsColDefs: CustomColDef[];
  buyerDefs: CustomColDef[];
  budgetCodeColDefs: CustomColDef[];
  gridParamsPoDetail: GridParams | undefined;
  selectedRowPoDetail;
  selectedNode;
  listPurchaseOrdersDetail;
  frameworkComponents;
  displayedData: InputPurchaseOrdersHeadersDto[] = [];
  inputPurchaseOrdersHeadersDto: InputPurchaseOrdersHeadersDto = new InputPurchaseOrdersHeadersDto();
  listPrCreatePo = [];
  poId: number
  poDetail: GetPoHeadersForEditDto = new GetPoHeadersForEditDto();
  budgetCodeDefault: string;
  currentInventoryId: number = 0;
  exchangeRate: CommonGetGlExchangeRateDto[] = [];

  gridParamsPrDetail: GridParams | undefined;
  gridParamsPrDetailAprrove: GridParams | undefined;
  gridParamsPrDetailReference: GridParams | undefined;
  listPurchaseOrdersDetailApprove;
  listPurchaseOrdersDetailReference;
  gridColDefDetailApprove: CustomColDef[];
  gridColDefDetailReference: CustomColDef[];

  gridColDefDetailForView: CustomColDef[];

  uploadData = [];
  newAttachments = []
  fileName: string = '';
  formData: FormData = new FormData();
  processInfo: any[] = [];
  listFileAttachment = [];
  urlBase: string = AppConsts.remoteServiceBaseUrl;
  dowloadUrl: string = AppConsts.remoteServiceBaseUrl + '/AttachFile/GetAttachFileToDownload';
  removeUrl: string = AppConsts.remoteServiceBaseUrl + '/AttachFile/RemoveAttachFile';
  uploadUrl: string = AppConsts.remoteServiceBaseUrl + '/AttachFile/UploadFileToFolder';
  attachmentsParams: GridParams;
  selectedAttachmentNode: RowNode;
  selectedAttachment: GetAllPurchaseOrdersAttachmentsForViewDto = new GetAllPurchaseOrdersAttachmentsForViewDto();
  tabKey: number = 1;
  isDisabled: boolean = false;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private gridTableService: GridTableService,
    private agDataValidateService: AgDataValidateService,
    private mstOrganizationsServiceProxy: MstOrganizationsServiceProxy,
    private mstLineTypeServiceProxy: MstLineTypeServiceProxy,
    private mstSupplierServiceProxy: MstSupplierServiceProxy,
    private mstCategoriesServiceProxy: MstCategoriesServiceProxy,
    private mstLocationsServiceProxy: MstLocationsServiceProxy,
    private purchaseRequestServiceProxy: PurchaseRequestServiceProxy,
    private mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
    private mstInventoryItemsServiceProxy: MstInventoryItemsServiceProxy,
    private mstUnitOfMeasureServiceProxy: MstUnitOfMeasureServiceProxy,
    private mstPeriodServiceProxy: MstPeriodServiceProxy,
    private purchaseOrdersServiceProxy: PurchaseOrdersServiceProxy,
    private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
    private _serviceProxy: UrUserRequestManagementServiceProxy,
    private _approvalProxy: RequestApprovalTreeServiceProxy,
    private _requetApproval: RequestApprovalServiceProxy,
    private _http: HttpClient,
    private _fileApi: CommonLookupServiceProxy
  ) {
    super(injector);
    this.gridColDefDetail = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        // cellRenderer: (params) => params.rowIndex + 1,
        width: 50,
        field: 'lineNum'
      },
      {
        headerName: this.l('Shipments'),
        headerTooltip: this.l('Shipments'),
        field: 'moreShipments',
        cellClass: ['cell-border'],
        cellRenderer: 'agCellButtonRendererComponent',
        buttonDef: {
          text: this.l('Shipments'),
          className: 'btn btn-outline-primary',
          function: this.openShipments.bind(this),
        },
        width: 70,
      },
      {
        headerName: this.l('Type'),
        headerTooltip: this.l('Type'),
        field: 'lineTypeId',
        cellClass: ['cell-border', 'custom-grid-text', 'custom-grid-cbb-text', 'cell-clickable'],
        width: 100,
        validators: ['required'],
        cellRenderer: 'agDropdownRendererComponent',
        list: () => { return this.listLineTypes.map(e => Object.assign({}, { key: e.value, value: e.label })) },
      },
      {
        headerName: this.l('PartNo'),
        headerTooltip: this.l('PartNo'),
        field: 'partNo',
        cellClass: (params) => (params.data?.lineTypeId === 1) ? ['cell-clickable', 'cell-border'] : ['cell-border'],
        editable: (params) => params.data?.lineTypeId === 1,
        width: 130,
        rowDrag: true,
      },
      {
        headerName: this.l('PartName'),
        headerTooltip: this.l('PartName'),
        field: 'partName',
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        validators: ['required'],
        width: 200,
      },
      // {
      //   headerName: this.l('Category'),
      //   headerTooltip: this.l('Category'),
      //   field: 'category',
      //   cellClass: ['cell-clickable', 'cell-border'],
      //   editable: true,
      //   validators: ['required'],
      //   width: 120,
      // },

      {
        headerName: this.l('UOM'),
        headerTooltip: this.l('UOM'),
        field: 'unitMeasLookupCode',
        cellClass: (params) => (params.data?.lineTypeId === 1) ? ['cell-clickable', 'cell-border'] : ['cell-border'],
        editable: true,
        width: 80,
        rowDrag: true,
      },
      {
        headerName: this.l('Quantity'),
        headerTooltip: this.l('Quantity'),
        field: 'quantity',
        editable: true,
        cellClass: ['cell-clickable', 'cell-border', 'text-right'],
        width: 80,
        validators: ['required', 'floatNumber'],
      },
      // {
      //   headerName: this.l('ForeignPrice'),
      //   headerTooltip: this.l('ForeignPrice'),
      //   field: 'foreignPrice',
      //   editable: true,
      //   validators: ['floatNumber'],
      //   cellClass: ['cell-border', 'text-right'],
      //   width: 70,
      //   valueFormatter: params => this.dataFormatService.floatMoneyFormat((params.value) ? params.value : 0),
      // },
      {
        headerName: this.l('Price'),
        headerTooltip: this.l('Price'),
        field: 'unitPrice',
        cellClass: (params) => !params.data?.partNo ? ['cell-clickable', 'cell-border'] : ['cell-border'],
        editable: (params) => !params.data?.partNo,
        validators: ['floatNumber'],
        width: 70,
        valueFormatter: params => this.dataFormatService.floatMoneyFormat((params.value) ? params.value : 0),
      },
      {
        headerName: this.l('Amount'),
        headerTooltip: this.l('Amount'),
        field: 'amount',
        cellClass: ['cell-border', 'text-right'],
        valueFormatter: params => this.dataFormatService.floatMoneyFormat((params.value) ? params.value : 0),
        width: 70,
      },
      {
        headerName: this.l('Promised'),
        headerTooltip: this.l('Promised'),
        field: 'promisedDate',
        valueGetter: params => this.dataFormatService.dateFormat(params.data.needByDate),
        cellClass: ['cell-border'],
        editable: true,
        width: 130,
        cellRenderer: 'agDatepickerRendererComponent'
      },
      {
        headerName: this.l('NeedByDate'),
        headerTooltip: this.l('NeedByDate'),
        field: 'needByDate',
        valueGetter: params => this.dataFormatService.dateFormat(params.data.needByDate),
        cellClass: ['cell-border'],
        editable: true,
        width: 130,
        cellRenderer: 'agDatepickerRendererComponent'
      },
      {
        headerName: this.l('BudgetCode'),
        headerTooltip: this.l('BudgetCode'),
        field: 'poChargeAccount',
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        width: 200,
        rowDrag: true,
      },
      {
        headerName: this.l('GlDate'),
        headerTooltip: this.l('GlDate'),
        field: 'glDate',
        valueGetter: params => this.dataFormatService.dateFormat(params.data.glDate),
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        width: 150,
        validators: ['required'],
        cellRenderer: 'agDatepickerRendererComponent'
      },
      {
        headerName: this.l('GuaranteeTerm'),
        headerTooltip: this.l('GuaranteeTerm'),
        field: 'guranteeTerm',
        cellClass: ['cell-border'],
        editable: true,
        width: 200,
      },
      {
        headerName: this.l('ForecastNextMonth'),
        headerTooltip: this.l('ForecastNextMonth'),
        children: [
          {
            headerName: this.l('ForecastN1'),
            headerTooltip: this.l('ForecastN'),
            field: 'attribute9',
            cellClass: ['cell-border'],
            width: 80,
            editable: true,
          },
          {
            headerName: this.l('ForecastN2'),
            headerTooltip: this.l('ForecastN1'),
            field: 'attribute12',
            cellClass: ['cell-border'],
            width: 80,
            editable: true,
          },
          {
            headerName: this.l('ForecastN3'),
            headerTooltip: this.l('ForecastN1'),
            field: '',
            cellClass: ['cell-border'],
            width: 80,
            editable: true,
          }
        ]
      },
      // {
      //   headerName: this.l('ChargeAccount'),
      //   headerTooltip: this.l('ChargeAccount'),
      //   field: 'chargeAccount',
      //   cellClass: ['cell-border'],
      //   width: 200,
      // },
    ];

    this.gridColDefDetailForView = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        // cellRenderer: (params) => params.rowIndex + 1,
        width: 50,
        field: 'lineNum'
      },
      {
        headerName: this.l('Shipments'),
        headerTooltip: this.l('Shipments'),
        field: 'moreShipments',
        cellClass: ['cell-border'],
        cellRenderer: 'agCellButtonRendererComponent',
        buttonDef: {
          text: this.l('Shipments'),
          className: 'btn btn-outline-primary',
          function: this.openShipments.bind(this),
        },
        width: 70,
      },
      {
        headerName: this.l('Type'),
        headerTooltip: this.l('Type'),
        field: 'lineTypeId',
        cellClass: ['cell-border', 'custom-grid-text', 'custom-grid-cbb-text'],
        width: 100,
        cellRenderer: 'agDropdownRendererComponent',
        list: () => { return this.listLineTypes.map(e => Object.assign({}, { key: e.value, value: e.label })) },
      },
      {
        headerName: this.l('PartNo'),
        headerTooltip: this.l('PartNo'),
        field: 'partNo',
        cellClass: (params) => (params.data?.lineTypeId === 1) ? ['cell-border'] : ['cell-border'],
        editable: (params) => params.data?.lineTypeId === 1,
        width: 100,
      },
      {
        headerName: this.l('PartName'),
        headerTooltip: this.l('PartName'),
        field: 'partName',
        cellClass: ['cell-border'],
        width: 200,
      },
      // {
      //   headerName: this.l('Category'),
      //   headerTooltip: this.l('Category'),
      //   field: 'category',
      //   cellClass: ['cell-border'],
      //   validators: ['required'],
      //   width: 120,
      // },

      {
        headerName: this.l('UOM'),
        headerTooltip: this.l('UOM'),
        field: 'uom',
        cellClass: (params) => (params.data?.lineTypeId === 1) ? ['cell-border'] : ['cell-border'],
        editable: (params) => params.data?.lineTypeId === 1,
        width: 80,
      },
      {
        headerName: this.l('Quantity'),
        headerTooltip: this.l('Quantity'),
        field: 'quantity',
        cellClass: ['cell-border', 'text-right'],
        width: 80,
        validators: ['required', 'integerNumber'],
      },
      {
        headerName: this.l('ForeignPrice'),
        headerTooltip: this.l('ForeignPrice'),
        field: 'foreignPrice',
        validators: ['floatNumber'],
        cellClass: ['cell-border', 'text-right'],
        width: 100,
        valueFormatter: params => this.dataFormatService.floatMoneyFormat((params.value) ? params.value : 0),
      },
      {
        headerName: this.l('Price'),
        headerTooltip: this.l('Price'),
        field: 'unitPrice',
        validators: ['floatNumber'],
        cellClass: ['cell-border', 'text-right'],
        width: 100,
        valueFormatter: params => this.dataFormatService.floatMoneyFormat((params.value) ? params.value : 0),
      },
      {
        headerName: this.l('Amount'),
        headerTooltip: this.l('Amount'),
        field: 'amount',
        cellClass: ['cell-border', 'text-right'],
        valueFormatter: params => this.dataFormatService.floatMoneyFormat((params.value) ? params.value : 0),
        width: 100,
      },
      {
        headerName: this.l('Promised'),
        headerTooltip: this.l('Promised'),
        field: 'promisedDate',
        valueGetter: params => this.dataFormatService.dateFormat(params.data.needByDate),
        cellClass: ['cell-border'],
        width: 130,
        cellRenderer: 'agDatepickerRendererComponent'
      },
      {
        headerName: this.l('NeedByDate'),
        headerTooltip: this.l('NeedByDate'),
        field: 'needByDate',
        valueGetter: params => this.dataFormatService.dateFormat(params.data.needByDate),
        cellClass: ['cell-border'],
        width: 130,
        cellRenderer: 'agDatepickerRendererComponent'
      },
      {
        headerName: this.l('ChargeAccount'),
        headerTooltip: this.l('ChargeAccount'),
        field: 'poChargeAccount',
        cellClass: ['cell-border'],
        width: 200,
      },
      {
        headerName: this.l('GlDate'),
        headerTooltip: this.l('GlDate'),
        field: 'glDate',
        valueGetter: params => this.dataFormatService.dateFormat(params.data.glDate),
        cellClass: ['cell-border'],
        width: 150,
        cellRenderer: 'agDatepickerRendererComponent'
      },
      {
        headerName: this.l('GuaranteeTerm'),
        headerTooltip: this.l('GuaranteeTerm'),
        field: 'guranteeTerm',
        cellClass: ['cell-border'],
        width: 200,
      },
      {
        headerName: this.l('ForecastNextMonth'),
        headerTooltip: this.l('ForecastNextMonth'),
        children: [
          {
            headerName: this.l('ForecastN'),
            headerTooltip: this.l('ForecastN'),
            field: 'attribute9',
            cellClass: ['cell-border'],
            width: 80,
          },
          {
            headerName: this.l('ForecastN1'),
            headerTooltip: this.l('ForecastN1'),
            field: 'attribute12',
            cellClass: ['cell-border'],
            width: 80,
          }
        ]
      },
      // {
      //   headerName: this.l('ChargeAccount'),
      //   headerTooltip: this.l('ChargeAccount'),
      //   field: 'chargeAccount',
      //   cellClass: ['cell-border'],
      //   width: 200,
      // },
    ];

    this.inventoryItemsDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        flex: 50,
      },
      {
        headerName: this.l('PartNo'),
        headerTooltip: this.l('PartNo'),
        field: 'partNo',
        flex: 200,
      },
      {
        headerName: this.l('PartName'),
        headerTooltip: this.l('PartName'),
        field: 'partName',
        flex: 200,
      },
      {
        headerName: this.l('Color'),
        headerTooltip: this.l('Color'),
        field: 'color',
        flex: 200,
      },
    ];

    this.categoryDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        flex: 30,
      },
      {
        headerName: this.l('Categories'),
        headerTooltip: this.l('Categories'),
        field: 'segment1',
        flex: 400,
      },
      {
        headerName: this.l('SubCategories'),
        headerTooltip: this.l('SubCategories'),
        field: 'segment2',
        flex: 400,
      }
    ];

    this.uomItemsDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        flex: 50,
      },
      {
        headerName: this.l('UOMCode'),
        headerTooltip: this.l('UOMCode'),
        field: 'uomCode',
        flex: 200,
      },
      {
        headerName: this.l('UOMClass'),
        headerTooltip: this.l('UOMClass'),
        field: 'uomClass',
        flex: 200,
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description',
        flex: 200,
      },
    ];

    this.locationDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        flex: 30,
      },
      {
        headerName: this.l('LocationCode'),
        headerTooltip: this.l('LocationCode'),
        field: 'locationCode',
        flex: 200,
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description',
        flex: 200,
      },
    ];

    this.requestersDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        flex: 50,
      },
      {
        headerName: this.l('Name'),
        headerTooltip: this.l('Name'),
        field: 'name',
        flex: 200,
      },
      {
        headerName: this.l('UserName'),
        headerTooltip: this.l('UserName'),
        field: 'userName',
        flex: 200,
      },
      {
        headerName: this.l('Email'),
        headerTooltip: this.l('Email'),
        field: 'email',
        flex: 200,
      }
    ];

    this.gridColDefDetailApprove = [
      {
        // STT
        headerName: this.l('No.'),
        headerTooltip: this.l('No.'),
        cellRenderer: (params) => params.rowIndex + 1,
        width: 50,
      },
      {
        headerName: this.l('Step'),
        headerTooltip: this.l('Step'),
        field: 'approvalSeq',
        cellClass: ['cell-border', 'custom-grid-text', 'custom-grid-cbb-text'],
        width: 70,
      },
      {
        headerName: this.l('UserApprove'),
        headerTooltip: this.l('UserApprove'),
        field: 'approvalUserName',
        cellClass: ['cell-border', 'text-left'],
        width: 150,
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
        valueFormatter: (params: ValueFormatterParams) => this.dataFormatService.dateFormat(params.value),
        cellClass: ['cell-border', 'text-left'],
        width: 120,
      },

      {
        headerName: this.l('ApproveDate'),
        headerTooltip: this.l('ApproveDate'),
        field: 'approvalDate',
        valueFormatter: (params: ValueFormatterParams) => this.dataFormatService.dateFormat(params.value),
        cellClass: ['cell-border', 'text-left'],
        width: 120,
    },
    {
        headerName: this.l('RejectDate'),
        headerTooltip: this.l('RejectDate'),
        field: 'rejectDate',
        valueFormatter: (params: ValueFormatterParams) => this.dataFormatService.dateFormat(params.value),
        cellClass: ['cell-border', 'text-left'],
        width: 120,
    },
      // {
      //   headerName: this.l('RejectDate'),
      //   headerTooltip: this.l('RejectDate'),
      //   field: 'rejectDate',
      //   valueGetter: params => this.dataFormatService.dateFormat(params.data.approvalDate),
      //   cellClass: ['cell-border', 'text-left'],
      //   width: 150,
      // },
      {
        headerName: this.l('Status'),
        headerTooltip: this.l('Status'),
        field: 'approvalStatus',
        valueFormatter: params => params.data ? this.handleStatus(params.data?.approvalStatus) : "",
        cellClass: ['cell-border', 'text-center'],
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

    this.supplierDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 50,
      },
      {
        headerName: this.l('Code'),
        headerTooltip: this.l('Code'),
        field: 'registryId',
        maxWidth: 150,
      },
      {
        headerName: this.l('SupplierName'),
        headerTooltip: this.l('SupplierName'),
        field: 'supplierName',
        flex: 350,
      },

    ];

    this.gridColDefDetailReference = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        //   cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        cellRenderer: (params) => params.rowIndex + 1,
        width: 50,
      },
      {
        headerName: this.l('TransactionType'),
        headerTooltip: this.l('TransactionType'),
        field: 'type',
        cellClass: ['cell-border'],
        width: 150,
      },
      {
        headerName: this.l('VoucherNumber'),
        headerTooltip: this.l('VoucherNumber'),
        field: 'number',
        cellClass: ['cell-border'],
        width: 150,
      },
      {
        headerName: this.l('VoucherNumberNo'),
        headerTooltip: this.l('VoucherNumberNo'),
        field: 'currentLineNum',
        cellClass: ['cell-border', 'text-right'],
        width: 200,
      },
      {
        headerName: this.l('VoucherNumberNoPr'),
        headerTooltip: this.l('VoucherNumberNoPr'),
        field: 'refLineNum',
        cellClass: ['cell-border', 'text-right'],
        width: 150,
      }
    ];

    this.buyerDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        flex: 50,
      },
      {
        headerName: this.l('Name'),
        headerTooltip: this.l('Name'),
        field: 'name',
        flex: 200,
      },
      {
        headerName: this.l('UserName'),
        headerTooltip: this.l('UserName'),
        field: 'userName',
        flex: 200,
      },
      {
        headerName: this.l('Email'),
        headerTooltip: this.l('Email'),
        field: 'email',
        flex: 200,
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
        headerName: this.l('Download'),
        headerTooltip: this.l('Download'),
        cellClass: ['text-center'],
        cellRenderer: "agCellButtonRendererComponent",
        buttonDef: {
          iconName: 'fa fa-file-download mr-0',
          className: 'grid-btn',
          function: params => this.dowloadAttachment(true, params),
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
        valueFormatter: (params: ValueFormatterParams) => this.dataFormatService.dateFormat(params.value),
        flex: 0.7
      }
    ];

    this.budgetCodeColDefs = [
      {
        headerName: this.l('BudgetCode'),
        headerTooltip: this.l('BudgetCode'),
        field: 'concatenatedSegments',
        cellClass: ['text-center', 'cell-border'],
        flex: 1
      }
    ];
  }

  ngOnInit(): void {
    this.frameworkComponents = {
      agDatepickerRendererComponent: AgDatepickerRendererComponent,
      agDropdownRendererComponent: AgDropdownRendererComponent,
      agCellButtonRendererComponent: AgCellButtonRendererComponent
    };
    this.buildFormPOHeaders();
    this.listOrganization = [];
    this.listLineTypes = [];
    this.listSuppliers = [];
    this.listInventoryGroups = [];
    this.listDestinationType = [];
    this.listPurchasePurpose = [];
    this.listLocations = [];
    this.listUsers = [];
    this.listCurrency = [];

    this.commonGeneralCacheServiceProxy.getAllSuppliers().subscribe((res) => {
      res.forEach(e => this.listSuppliers.push({ label: (e.supplierName), value: e.id }))
    });

    this.commonGeneralCacheServiceProxy.getAllUsersInfo().subscribe((res) => {
      res.forEach(e => this.listUsers.push({ label: (e.name), value: e.id }))
    })

    // this.getAllSupplier();
    this.mstOrganizationsServiceProxy.getAllOrganizations().subscribe((res) => {
      res.forEach(e => this.listOrganization.push({ label: e.name, value: e.id }))
    });

    this.mstLineTypeServiceProxy.getAllLineTypes()
      .pipe(finalize(() => {
        this.gridParamsPoDetail?.api.redrawRows();
      }))
      .subscribe((res) => {
        res.forEach(e => this.listLineTypes.push({ label: e.lineTypeCode, value: e.id }))
      });

    this.mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
      res.forEach(e => this.listInventoryGroups.push({ label: e.productGroupName, value: e.id }))
    });

    this.commonGeneralCacheServiceProxy.getAllCurrencies().subscribe((res) => {
      res.forEach(e => this.listCurrency.push({ label: e.currencyCode, value: e.currencyCode }))
    });

    this.commonGeneralCacheServiceProxy.getAllLocations().subscribe((res) => {
      res.forEach(e => this.listLocations.push({ label: e.locationCode, value: e.id }))
    })

    this.commonGeneralCacheServiceProxy.getGlExchangeRate('', '', undefined)
      .subscribe(res => {
        this.exchangeRate = res;
      });

    this.mstLocationsServiceProxy.getLocationById(21).subscribe((val) => {
      this.createOrEditForm.get('shipToLocationId').setValue(val.id);
      this.createOrEditForm.get('shipToLocationName').setValue(val.locationCode);
    });

    this.mstLocationsServiceProxy.getLocationById(43).subscribe((val) => {
      this.createOrEditForm.get('billToLocationName').setValue(val.locationCode);
      this.createOrEditForm.get('billToLocationId').setValue(val.id);
    });

    this.commonGeneralCacheServiceProxy.geUserById(this.createOrEditForm.get('buyerId').value).subscribe((val) => {
      this.createOrEditForm.get('position').setValue(val.title);
      this.createOrEditForm.get('email').setValue(val.email);
      this.createOrEditForm.get('tel').setValue(val.tel);
    });


    this.listDestinationType.push({ label: 'Expense', value: 'EXPENSE' });
    this.listDestinationType.push({ label: 'Inventory', value: 'INVENTORY' });

    this.listLookupCode.push({ label: 'Blanket Purchase Agreement', value: 'BLANKET' });
    this.listLookupCode.push({ label: 'Contract Purchase Agreement', value: 'CONTRACT' });
    this.listLookupCode.push({ label: 'Planned Purchase Order', value: 'PLANNED' });
    this.listLookupCode.push({ label: 'Standard Purchase Order', value: 'STANDARD' });

    this.mstLocationsServiceProxy.getAllLocations('').subscribe((res) => {
      res.forEach(e => this.listLocations.push({ label: e.locationCode, value: e.id }))
    })

    this.commonGeneralCacheServiceProxy.getGlCombaination().subscribe((val) => {
      this.budgetCodeDefault = val.concatenatedSegments;
    });
  }

  buildFormPOHeaders() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      segment1: [undefined],
      typeLookupCode: [undefined],
      refGpsNo: [undefined],
      total: [0],
      buyerId: [this.appSession.userId, GlobalValidator.required],
      buyerName: [this.appSession.user.surname, GlobalValidator.required],
      position: [undefined],
      authorizationStatus: ['Incomplete'],
      vendorId: [undefined],
      vendorName: [undefined],
      tel: [undefined],
      shipToLocationId: [undefined],
      shipToLocationName: [undefined],
      vendorSiteId: [undefined],
      email: [undefined],
      billToLocationId: [undefined],
      billToLocationName: [undefined],
      vendorContactId: [undefined],
      currencyCode: [undefined],
      inventoryGroupId: [undefined],
      description: [undefined],
      chargeAccount: [undefined],
      documentType: ['Purchase orders'],
      rateDate: new Date(),
      termsId: [10061],
      attribute10: [undefined],
      freight: [undefined],
      attribute11: [undefined],
      carrier: [undefined],
      attribute12: [undefined],
      fob: [undefined],
      attribute13: [undefined],
      payOn: [undefined],
      attribute14: ['T/T (tele transfer)'],
      attribute15: ['VAT Excluded'],
      personSigningId: [undefined],
      termDescription: [undefined],
      ContractExpirationDate: [undefined],
      poRef: [undefined],
      isPrepayReceipt: [undefined],
    });

    this.createOrEditForm.get('vendorId').valueChanges.subscribe((val) => {
      this.listSites = [];
      this.commonGeneralCacheServiceProxy.getAllSupplierSitesBySupplerId(val ?? 0).subscribe((res) => {
        res.forEach(e => this.listSites.push({ label: e.vendorSiteCode, value: e.id }))
      });
    });

    this.createOrEditForm.get('vendorSiteId').valueChanges.subscribe((val) => {
      this.listSupplierContacts = [];
      this.commonGeneralCacheServiceProxy.getAllSupplierContact(val ?? 0).subscribe((res) => {
        res.forEach(e => this.listSupplierContacts.push({ label: (e.firstName + ' ' + e.midName + ' ' + e.lastName), value: e.id }))
      });
    });

    this.createOrEditForm.get('typeLookupCode').valueChanges.subscribe((val) => {
      if ("CONTRACT" === val) {
        this.createOrEditForm.get('totalPrice').enable();
        this.isRequired = true;

      }
      else {
        this.createOrEditForm.get('totalPrice').disable();
        this.isRequired = false;
      }
    });
  }

  addRow() {

    if (!this.validateBeforeAddRow()) {
      return;
    }

    if (!this.createOrEditForm.get('vendorId').value) {
      this.notify.warn(this.l('VendorEmpty'));
      return;
    }


    const blankProduct = {
      lineNum: this.displayedData.length + 1,
      lineTypeId: undefined,
      id: 0,
      partNo: undefined,
      partName: undefined,
      quantity: undefined,
      uom: undefined,
      unitMeasLookupCode: undefined,
      foreignPrice: undefined,
      unitPrice: 0,
      category: undefined,
      categoryId: undefined,
      itemId: undefined,
      needByDate: undefined,
      amount: 0,
      promisedDate: undefined,
      guranteeTerm: undefined,
      glDate: new Date(),
      poChargeAccount: undefined
    }

    this.gridParamsPoDetail?.api.applyTransaction({ add: [blankProduct] });
    const rowIndex = this.gridParamsPoDetail?.api.getDisplayedRowCount() - 1;
    setTimeout(() => {
      this.gridParamsPoDetail?.api.startEditingCell({ colKey: 'partNo', rowIndex });
      this.selectedNode = this.gridParamsPoDetail.api.getRowNode(`${rowIndex}`);
      this.gridParamsPoDetail?.api.getRowNode(`${rowIndex}`).setSelected(true);
    }, 100);
    this.getDisplayedData();
  }

  validateBeforeAddRow() {
    const inventoryGroupId = this.createOrEditForm.get('inventoryGroupId').value;
    if (!inventoryGroupId || inventoryGroupId === 0) {
      this.notify.warn(this.l('EnterInventoryGroupBeforeAddLine'))
      return;
    }
    return this.agDataValidateService.validateDataGrid(this.gridParamsPoDetail, this.gridColDefDetail, this.displayedData);
  }


  callBackGridPoDetail(params: GridParams) {
    this.gridParamsPoDetail = params;
    this.gridParamsPoDetail?.api.setRowData([]);
    // this.gridTableService.selectFirstRow(this.gridParamsPoDetail.api)
  }

  onChangeSelectionPoDetail(params: GridParams) {
    const selectedRows = params?.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowPoDetail = selectedRows[0];
    }
    this.selectedNode = this.gridParamsPoDetail?.api.getSelectedNodes()[0] ?? [];
    this.gridParamsPoDetail?.api.getRowNode(`${this.selectedNode.rowIndex}`)?.setSelected(true);
    // this.formPRLines.patchValue(this.selectedRowPrDetail);
  }

  agKeyUp(event: KeyboardEvent) {
    event.stopPropagation();
    // Press enter to search with modal
    if (event.key === 'ArrowDown') this.addRow();
  }

  getDisplayedData() {
    this.displayedData = this.gridTableService.getAllData(this.gridParamsPoDetail);
    let sumTotal = 0;
    this.gridTableService.getAllData(this.gridParamsPoDetail).forEach((val) => {
      sumTotal += Number(val.amount);
      this.createOrEditForm.get('total').setValue(this.dataFormatService.formatMoney(sumTotal));
    })
  }

  callBackGridPoDetailAprrove(params: GridParams) {
    this.gridParamsPrDetailAprrove = params;
    params.api.setRowData(this.listPurchaseOrdersDetailApprove);
  }

  callBackGridPoDetaillReference(params: GridParams) {
    this.gridParamsPrDetailReference = params;
    params.api.setRowData(this.listPurchaseOrdersDetailReference);
    params.api.sizeColumnsToFit();
  }

  cellValueChanged(params: AgCellEditorParams) {
    const field = params.colDef.field;
    const rowIndex = this.gridParamsPoDetail?.api.getDisplayedRowCount() - 1;
    this.selectedNode = params.node;
    switch (field) {
      case 'lineTypeId':
        if (field === 'lineTypeId') {
          if (params.data[field] === 1) {
            this.gridParamsPoDetail?.api.startEditingCell({ colKey: 'partNo', rowIndex });
          } else {
            params.data['partNo'] = '';
            this.gridParamsPoDetail?.api.startEditingCell({ colKey: 'partName', rowIndex });
          }
        }
        break;
      case 'itemDescription':
        this.gridParamsPoDetail?.api.startEditingCell({ colKey: 'quantity', rowIndex });
        break;
      case 'quantity':
        if (Number(params.data['quantity']) < 0) {
          this.notify.warn(this.l('QuanityGreatZero'));
          this.gridParamsPoDetail.api.startEditingCell({ colKey: 'quantity', rowIndex });
          return;
        }
        params.data['amount'] = Math.round(Number(params.data['quantity'] ?? 0) * Number(params.data['unitPrice'] ?? 0) * 100) / 100;
        this.gridParamsPoDetail.api.startEditingCell({ colKey: 'needByDate', rowIndex });
        break;
      case 'unitPrice':
        if (Number(params.data['unitPrice']) < 0) {
          this.notify.warn(this.l('PriceGreatZero'));
          this.gridParamsPoDetail.api.startEditingCell({ colKey: 'unitPrice', rowIndex });
          return;
        }
        params.data['amount'] = Math.round(Number(params.data['quantity'] ?? 0) * Number(params.data['unitPrice'] ?? 0) * 100) / 100;
        break;
      // case 'needByDate':
      //   const timeNow = new Date().getTime();
      //   if (params.data['needByDate'] < timeNow) {
      //     this.notify.warn(this.l('NeedByDateGreatToday'))
      //   }
      //   break;
    }

    this.getDisplayedData();
    this.gridParamsPoDetail.api.refreshCells();
  }

  cellEditingStopped(params: AgCellEditorParams) {
    const col = params.colDef.field;
    const rowIndex = this.gridParamsPoDetail.api.getDisplayedRowCount() - 1;
    switch (col) {
      case 'lineTypeId':
        if (params.data[col] === 1) {
          this.gridParamsPoDetail.api.startEditingCell({ colKey: 'partNo', rowIndex });
        }
        break;
      case 'needByDate':
        if (params.data[col] && params.data[col] < moment()) {
          this.gridParamsPoDetail.api.startEditingCell({ colKey: 'needByDate', rowIndex });
          this.notify.warn(this.l('CannotLessThanCurrentDate'));
        }
        break;
    }
  }

  searchByEnter(params: ICellEditorParams) {
    const col = params?.colDef?.field;
    switch (col) {
      case 'category':
        this.listCategory.show(
          params.data?.category ?? '',
          undefined,
          undefined,
          'category'
        );
        break;
      case 'partNo':
        this.listInventoryItems.show(
          params.data?.partNo ?? '',
          undefined,
          undefined,
          'partNo'
        );
        break;
      case 'unitMeasLookupCode':
        this.listUOM.show(
          params.data?.unitMeasLookupCode ?? '',
          undefined,
          undefined,
          'unitMeasLookupCode'
        );
        break;
      case 'poChargeAccount':
        this.selectBudgetCodeHeadModal.show(
          params.data?.poChargeAccount ?? '',
          undefined,
          undefined,
          'poChargeAccount'
        );
        break;
    }
  }

  //#region  patch value

  showSearchBuyer() {
    this.listBuyer.show(this.createOrEditForm.get('buyerName').value);
  }

  showSearchSupplier() {
    this.listSupplierPopup.show(this.createOrEditForm.get('vendorName').value);
  }

  showSearchBillLocation() {
    this.listLocationBill.show(this.createOrEditForm.get('billToLocationName').value);
  }

  showSearchShipLocation() {
    this.listLocationShip.show(this.createOrEditForm.get('shipToLocationName').value);
  }

  patchChargeAccount(event: any) {
    this.createOrEditForm.get('chargeAccount').setValue(event.concatenatedSegments);
  }

  patchBuyer(event: any) {
    this.createOrEditForm.get('buyerName').setValue(event.name);
    this.createOrEditForm.get('buyerId').setValue(event.id);
  }

  patchSupplier(event: any) {
    this.createOrEditForm.get('vendorName').setValue(event.supplierName);
    this.createOrEditForm.get('vendorId').setValue(event.id);
  }

  patchLocationBill(event: any) {
    this.createOrEditForm.get('billToLocationName').setValue(event.locationCode);
    this.createOrEditForm.get('billToLocationId').setValue(event.id);
  }

  patchLocationShip(event: any) {
    this.createOrEditForm.get('shipToLocationName').setValue(event.locationCode);
    this.createOrEditForm.get('shipToLocationId').setValue(event.id);
  }

  getAllBuyers(userName: any, paginationParams: PaginationParamsModel) {
    return this.purchaseRequestServiceProxy.getListRequester(userName,
      (paginationParams ? paginationParams.sorting : ''),
      (paginationParams ? paginationParams.pageSize : 20),
      (paginationParams ? paginationParams.skipCount : 1));
  }

  getAllChargeAccount(budgetCode: string, paginationParams: PaginationParamsModel) {
    return this.commonGeneralCacheServiceProxy.getAllGlCodeCombinations(
      budgetCode ?? '',
      paginationParams ? paginationParams.sorting : '',
      paginationParams ? paginationParams.pageSize : 20,
      paginationParams ? paginationParams.skipCount : 0
    );
  }

  //#region api get list
  getAllSupplier(suplierName: any, paginationParams: PaginationParamsModel) {
    return this.mstSupplierServiceProxy.getAllSupplierNotPaged(
      suplierName ?? ''
    );
  }

  patchCategory(event: any) {
    this.selectedNode.data.category = event.segment1 + '.' + event.segment2;
    this.selectedNode.data.categoryId = event.id;
    this.gridParamsPoDetail?.api.applyTransaction({ update: [this.selectedNode.data] });
  }

  patchInventoryItems(event: any) {
    const fieldToCheck = { name: this.l('PartNo'), field: 'partNo' };
    let exchangeRate: number = 1;
    this.selectedNode.data.partNo = event.partNo;
    this.selectedNode.data.partName = event.partName;
    this.selectedNode.data.uom = event.primaryUnitOfMeasure;
    this.selectedNode.data.unitMeasLookupCode = event.primaryUnitOfMeasure;
    this.selectedNode.data.foreignPrice = event.unitPrice;
    if (this.exchangeRate.length > 0) {
      const rateFilter = this.exchangeRate.filter(excRate => excRate.fromCurrency === event.currencyCode
        && excRate.toCurrency === this.createOrEditForm.get('currencyCode').value
      );
      exchangeRate = rateFilter[0]?.conversionRate ?? 1;
      this.selectedNode.data.unitPrice = (event.unitPrice * exchangeRate);
    } else {
      this.selectedNode.data.unitPrice = event.unitPrice;
    }
    this.selectedNode.data.itemId = event.id;
    this.selectedNode.data.currencyCode = event.currencyCode;
    this.selectedNode.data.poChargeAccount = this.budgetCodeDefault;
    this.gridParamsPoDetail?.api.applyTransaction({ update: [this.selectedNode.data] });
    const rowIndex = this.gridParamsPoDetail?.api.getDisplayedRowCount() - 1;
    this.gridParamsPoDetail?.api.startEditingCell({ colKey: 'quantity', rowIndex });
  }

  patchUOM(event: any) {
    this.selectedNode.data.uom = event.unitOfMeasure;
    this.selectedNode.data.unitMeasLookupCode = event.unitMeasLookupCode;
    this.gridParamsPoDetail?.api.applyTransaction({ update: [this.selectedNode.data] });
  }

  //#endregion

  //#region api get all for select model
  getAllCategories(categoriesName: any, paginationParams: PaginationParamsModel) {
    return this.mstCategoriesServiceProxy.getAllCategoties(categoriesName ?? '');
  }

  getAllInventoryItems(partNo: any, paginationParams: PaginationParamsModel) {
    return this.commonGeneralCacheServiceProxy.getAllInventoryItemsByGroup(
      this.createOrEditForm.get('inventoryGroupId').value,
      this.createOrEditForm.get('vendorId').value,
      this.createOrEditForm.get('currencyCode').value,
      partNo,
      this.createOrEditForm.get('rateDate').value
    )
  }

  getAllUOM(unitOfMeasure: any, paginationParams: PaginationParamsModel) {
    return this.mstUnitOfMeasureServiceProxy.getAllUmoNotPaged(unitOfMeasure, '', '');
  }

  getAllLocations(locationCode: any, paginationParams: PaginationParamsModel) {
    return this.mstLocationsServiceProxy.getAllLocations(locationCode)
  }

  getAllRequesters(userName: any, paginationParams: PaginationParamsModel) {
    return this.purchaseRequestServiceProxy.getListRequester(userName,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 10000),
      (this.paginationParams ? this.paginationParams.skipCount : 1));
  }
  //#endregion

  removeSelectedRow() {
    if (!this.selectedRowPoDetail) {
      this.notify.warn(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete);
      return;
    }
    this.gridParamsPoDetail.api.applyTransaction({ remove: [this.selectedNode.data] })
    this.selectedRowPoDetail = undefined;
    this.getDisplayedData();
  }

  onChangeInventoryGroup(event: any) {
    // this.currentInventoryId = this.createOrEditForm.value.inventoryGroupId;

    if (this.currentInventoryId && event && this.currentInventoryId !== event && this.displayedData.length > 0)
      this.message.confirm(this.l('WarrningChangingInventoryGroup'), this.l('AreYouSure'), (isConfirmed) => {
        if (isConfirmed) {
          this.displayedData = [];
          this.gridParamsPoDetail.api.setRowData(this.displayedData);
          this.currentInventoryId = this.createOrEditForm.value.inventoryGroupId;
        } else {
          this.createOrEditForm.patchValue({ inventoryGroupId: this.currentInventoryId })
        }
      });
  }

  reset() {

  }
  closeModal() {
    this.modal.hide();
  }

  openShipments(param: any) {
    // if (this.displayedData.length && this.displayedData.length <= 0) {
    //   this.notify.warn(this.l('ListItemsEmpty'));
    //   return;
    // }

    // if (!this.validateBeforeAddRow()) {
    //   return;
    // }

    this.poShipments.showModal(param.data, this.tabKey);
  }

  replyRequest() {
    this._requetApproval.replyFromHeader(this.poId, this.poDetail.replyNote).subscribe(e => {
      this.notify.success("Successfully Reply")
    })
  }

  show(id: number, isDisabled: boolean, tabKey?: number) {
    this.tabKey = tabKey ?? 1;
    this.isDisabled = isDisabled;
    if (tabKey === 2) {
      this.createOrEditForm.get('buyerName').disable();
      this.createOrEditForm.get('vendorName').disable();
      this.createOrEditForm.get('shipToLocationName').disable();
      this.createOrEditForm.get('billToLocationName').disable();
      this.createOrEditForm.get('currencyCode').disable();
      this.createOrEditForm.get('inventoryGroupId').disable();
      this.createOrEditForm.get('documentType').disable();
      this.createOrEditForm.get('description').disable();

      this.gridParamsPoDetail.columnApi.getAllColumns().forEach(e => {
        e.getColDef().editable = false;
        e.getColDef().cellClass = ['cell-border'];
      })
    }
    this.poId = id;
    this.spinnerService.show();
    this.purchaseOrdersServiceProxy.getPoHeadersForEdit(id)
      .pipe(finalize(() => {
        this.spinnerService.hide();
        this.getApprovalInfos(id);
        this.getReference(id);
      }))
      .subscribe((result) => {
        this.poDetail = result;
        let name = "";
        if ((this.poDetail.replyNote ?? "").split(":").length > 1) name = (this.poDetail.replyNote ?? "").split(":")[0];
        this.poDetail.replyNote = (this.poDetail.replyNote ?? "").slice(name.length >= 1 ? name.length + 1 : 0, (this.poDetail.replyNote ?? "").length);

        this.createOrEditForm.patchValue(result);
        this.commonGeneralCacheServiceProxy.geUserById(this.createOrEditForm.get('buyerId').value).subscribe((val) => {
          this.createOrEditForm.get('position').setValue(val.title);
          this.createOrEditForm.get('email').setValue(val.email);
          this.createOrEditForm.get('tel').setValue(val.tel);
        });

        this.createOrEditForm.get('authorizationStatus').setValue(this.handleStatus(result.authorizationStatus));
        this.gridParamsPoDetail.api.setRowData(result.inputPurchaseOrderLinesDtos);
        this.attachmentsParams?.api.setRowData(result.attachments);
        this.listFileAttachment = result.attachments ?? [];
        this.uploadData = result.attachments ?? [];
        this.modal.show();
        this.getDisplayedData();
      });
  }

  pathShipments(event: Event) {
    this.selectedNode.data = event;
    this.getDisplayedData();
  }

  getApprovalInfos(id: number) {
    this.spinnerService.show();
    this._serviceProxy.getAllApprovalInfo(id, "PO")
      .pipe(finalize(() => this.spinnerService.hide()))
      .subscribe(res => {
        this.gridParamsPrDetailAprrove.api.setRowData(res);
      });
  }

  getReference(id: number) {
    this.spinnerService.show();
    this.commonGeneralCacheServiceProxy.getListReference(id, 'PO')
      .pipe(finalize(() => this.spinnerService.hide()))
      .subscribe(res => {
        this.gridParamsPrDetailReference.api.setRowData(res);
      });
  }

  createPo() {

    if (!this.validateBeforeAddRow()) {
      return;
    }

    if (!this.createOrEditForm.get('vendorId').value) {
      this.notify.warn(this.l('VendorEmpty'));
      return;
    }

    if (!this.createOrEditForm.get('chargeAccount').value) {
      this.notify.warn(this.l('CannotBeEmpty', this.l('BudgetCode')));
      return;
    }

    this.inputPurchaseOrdersHeadersDto = Object.assign(this.createOrEditForm.getRawValue(), {
      inputPurchaseOrderLinesDtos: this.displayedData
    });
    this.spinnerService.show();
    this.purchaseOrdersServiceProxy.createPurchaseOrders(this.inputPurchaseOrdersHeadersDto)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((val) => {
        if (this.uploadData.length > 0) {
          const listUpload = this.uploadData.filter(u => !u.id);
          this.saveUpload(listUpload, val);
          // this.uploadData.forEach(e => {

          // });
        }
        else {
          this.close.emit();
          this.modal.hide();
        }
        this.notify.success(this.l('SavedSuccessfully'));
      });
  }

  count = 0;
  saveUpload(params: any[], reqId: any) {
    this.spinnerService.show();
    var e = params.find((e, i) => i == this.count)
    if (!(e?.id && e?.id > 0)) {
      if (e) {
        this._http
          .post<any>(this.uploadUrl, e.file, {
            params: {
              type: 'PO',
              serverFileName: e.serverFileName,
              headerId: reqId,
              originalFileName: e.originalFileName
            }
          })
          .pipe(finalize(() => {
            this.count++;
            this.saveUpload(this.uploadData, reqId);
          }))
          .subscribe();
      }
      else {
        this.spinnerService.hide();
        this.count = 0;
        this.refreshFile();
        this.modal.hide();
        // this.getPurchaseOrderForEdit(reqId);
      }
    }
  }

  sendRequest() {

    if (!this.validateBeforeAddRow()) {
      return;
    }

    if (!this.createOrEditForm.get('vendorId').value) {
      this.notify.warn(this.l('VendorEmpty'));
      return;
    }

    this.viewDetailApprove.showModal(this.poId, 'PO');


    // if (this.poId > 0) {
    //   let body = Object.assign(new CreateRequestApprovalInputDto(), {
    //     reqId: this.poId,
    //     processTypeCode: 'PO'
    //   })
    //   this.message.confirm(this.l('AreYouSure'), this.l('SendRequestApprove'), (isConfirmed) => {
    //     if (isConfirmed) {
    //       this.spinnerService.show();
    //       this._approvalProxy.createRequestApprovalTree(body)
    //         .pipe(finalize(() => {
    //           this.spinnerService.hide();
    //         }))
    //         .subscribe(res => {
    //           this.notify.success(this.l('Successfully'))
    //           this.modal.hide();
    //         })
    //     }
    //   })
    // } else {
    //   this.notify.warn(this.l('SelectLine'));
    // }
  }

  callBackAttachmentsGrid(params: GridParams) {
    this.attachmentsParams = params;
    this.attachmentsParams.api.setRowData(this.uploadData);
  }

  onChangeAttachmentSelection(params: any) {
    let selectedNode = params.api?.getSelectedNodes()[0];
    if (this.selectedNode) this.selectedAttachmentNode = selectedNode;
    this.selectedAttachment = params.api?.getSelectedRows()[0] ?? new GetAllPurchaseOrdersAttachmentsForViewDto();
  }

  dowloadAttachment(isCell: boolean, gridParams: any) {
    if (isCell) {
      this.spinnerService.show();
      this._http
        .get(this.dowloadUrl, { params: { 'filename': gridParams.data?.serverFileName, 'rootPath': gridParams.data?.rootPath }, responseType: 'blob' })
        .pipe(finalize(() => this.spinnerService.hide()))
        .subscribe(blob => FileSaver.saveAs(blob, gridParams.data.fileName));
    }
    else {
      this.poDetail.attachments.forEach(file => {
        this._http
          .get(this.dowloadUrl, { params: { 'filename': file.serverFileName, 'rootPath': file.rootPath }, responseType: 'blob' })
          .pipe(finalize(() => this.spinnerService.hide()))
          .subscribe(blob => FileSaver.saveAs(blob, file.fileName));
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
          // this.selcet.attachments = [];
          // this.selectedRowPrDetail.attachments = this.gridTableService.getAllData(this.selectedAttachmentNode);
        }
      })
    }
    else {
      this.attachmentsParams?.api.applyTransaction({ remove: [this.selectedAttachmentNode.data] });
      // this.selectedRowPrDetail.attachments = [];
      // this.selectedRowPrDetail.attachments = this.gridTableService.getAllData(this.attachmentsParams);
    }
  }

  refreshFile() {
    this.uploadData = [];
    this.attachmentsParams.api?.setRowData([]);
  }

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

  onUpload(files: Array<any>): void {
    if (files.length > 0) {
      files.forEach(f => {
        let formData: FormData = new FormData();
        let serverName = 'PR_' + Date.now().toString() + '_' + f.name;
        formData.append('file', f);
        this.uploadData.push(Object.assign({
          file: formData,
          fileName: f.name,
          serverFileName: serverName,
          originalFileName: f.name,
          uploadTime: new Date()
        }));

        //   this.newAttachments.push(Object.assign({
        //     file: formData,
        //     fileName: f.name,
        //     serverFileName: serverName,
        //     uploadTime: new Date(),
        // }));
      })
      this.attachmentsParams?.api.setRowData(this.uploadData);
    }
  }

  showChargeAccount() {
    this.selectChargeAccount.show(this.createOrEditForm.get('chargeAccount').value);
  }

  changeDocumentDate() {
    this.commonGeneralCacheServiceProxy.getGlExchangeRate('', '', this.createOrEditForm.get('rateDate').value)
      .subscribe(res => {
        this.exchangeRate = res;

        let exchangeRate: number = 1;
        if (this.exchangeRate.length > 0) {
          this.gridParamsPoDetail.api.forEachNode(node => {
            const rateFilter = this.exchangeRate.filter(excRate => excRate.fromCurrency === node.data.currencyCode
              && excRate.toCurrency === this.createOrEditForm.get('currencyCode').value
            );
            exchangeRate = rateFilter[0]?.conversionRate ?? 1;
            node.data.unitPrice = (node.data.foreignPrice * exchangeRate);
            node.data.amount = node.data.unitPrice * node.data.quantity;
            this.gridParamsPoDetail.api.applyTransaction({ update: [node.data] });
          });
        }
        this.getDisplayedData();
      });
  }

  patchBudgetCode(event: any) {
    this.selectedNode.data.poChargeAccount = event.concatenatedSegments;
    this.gridParamsPoDetail.api.applyTransaction({ update: [this.selectedNode.data] });
  }

  getAllGlCode(budgetCode: string, paginationParams: PaginationParamsModel) {
    return this.commonGeneralCacheServiceProxy.getAllGlCodeCombinations(
      budgetCode ?? '',
      paginationParams ? paginationParams.sorting : '',
      paginationParams ? paginationParams.pageSize : 20,
      paginationParams ? paginationParams.skipCount : 0
    );
  }

  handleStatus(status: string) {
    switch (status) {
      case 'NEW':
        return this.l('New');
      case 'INCOMPLETE':
        return this.l('New');
      case 'PENDING':
        return this.l('');
      case 'WAITTING':
        return this.l('Waitting');
      case 'APPROVED':
        return this.l('Approved');
      case 'REJECTED':
        return this.l('Rejected');
      case 'FORWARD':
        return this.l('Forward');
    }
  }

  showTerms() {
    this.poTerms.showModal(this.createOrEditForm.getRawValue());
  }

  pathTerms(e: Event) {
    this.createOrEditForm.patchValue(e);
  }

}
