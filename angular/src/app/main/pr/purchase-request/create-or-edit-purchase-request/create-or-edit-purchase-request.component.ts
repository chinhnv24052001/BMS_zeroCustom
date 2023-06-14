import { ICellEditorParams, ICellRendererParams, RowNode, ValueFormatterParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgCellButtonRendererComponent } from '@app/shared/common/grid-input-types/ag-cell-button-renderer/ag-cell-button-renderer.component';
import { AgCheckboxRendererComponent } from '@app/shared/common/grid-input-types/ag-checkbox-renderer/ag-checkbox-renderer.component';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AgDataValidateService } from '@app/shared/services/ag-data-validate.service';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, CommonGetGlExchangeRateDto, CommonLookupServiceProxy, CreateRequestApprovalInputDto, GetMstInventoryGroupDto, GetPurchaseRequestDistributionsDto, GetPurchaseRequestLineForEditDto, GetRequesterInfoForViewDto, InputPurchaseRequestHeaderDto, InputPurchaseRequestLineDto, InputSearchMstCurrency, MstCategoriesServiceProxy, MstCurrencyServiceProxy, MstInventoryGroupServiceProxy, MstInventoryItemsServiceProxy, MstLineTypeServiceProxy, MstLocationsServiceProxy, MstOrganizationsServiceProxy, MstPeriodServiceProxy, MstPurchasePurposeServiceProxy, MstSupplierServiceProxy, MstUnitOfMeasureServiceProxy, PurchaseRequestServiceProxy, RequestApprovalTreeServiceProxy, RequestNextApprovalTreeInputDto, SupplierOutputSelectDto } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { AbpSessionService } from 'abp-ng2-module';
import { ceil } from 'lodash-es';
import { DateTime } from 'luxon';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';
import { PurchaseRequestDistributionsModalComponent } from '../purchase-request-distributions-modal/purchase-request-distributions-modal.component';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';

@Component({
  selector: 'create-or-edit-purchase-request',
  templateUrl: './create-or-edit-purchase-request.component.html',
  styleUrls: ['./create-or-edit-purchase-request.component.less']
})
export class CreateOrEditPurchaseRequestComponent extends AppComponentBase implements OnInit {

  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('listSupplierPopup', { static: true }) listSupplierPopup!: TmssSelectGridModalComponent;
  @ViewChild('listCategory', { static: true }) listCategory!: TmssSelectGridModalComponent;
  @ViewChild('listSite', { static: true }) listSite!: TmssSelectGridModalComponent;
  @ViewChild('listLocation', { static: true }) listLocation!: TmssSelectGridModalComponent;
  @ViewChild('listInventoryItems', { static: true }) listInventoryItems!: TmssSelectGridModalComponent;
  @ViewChild('listUOM', { static: true }) listUOM!: TmssSelectGridModalComponent;
  @ViewChild('listRequester', { static: true }) listRequester!: TmssSelectGridModalComponent;
  @ViewChild('prDistributions', { static: true }) prDistributions: PurchaseRequestDistributionsModalComponent;
  @ViewChild('selectBudgetCodeHeadModal', { static: true }) selectBudgetCodeHeadModal: TmssSelectGridModalComponent;
  @ViewChild('selectChargeAccount', { static: true }) selectChargeAccount: TmssSelectGridModalComponent;
  @ViewChild('viewDetailApprove', { static: true }) viewDetailApprove: ViewListApproveDetailComponent;
  @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
  @Output() close = new EventEmitter<any>();
  createOrEditForm: FormGroup;
  // formPRLines: FormGroup;
  isEdit = true;
  isSubmit = false;
  listInventoryGroups: { label: string, value: string | number }[] = [];
  listSupplier: { label: string, value: string | number }[] = [];
  listOrganization: { label: string, value: string | number }[] = [];
  listLineTypes: { label: string, value: string | number }[] = [];
  listDestinationType: { label: string, value: string | number }[] = [];
  listCurrency: { label: string, value: string | number }[] = [];
  listPurchasePurpose: { label: string, value: string | number }[] = [];
  requester: GetRequesterInfoForViewDto = new GetRequesterInfoForViewDto();
  gridColDefDetail: CustomColDef[];
  supplierDefs: CustomColDef[];
  categoryDefs: CustomColDef[];
  siteDefs: CustomColDef[];
  locationDefs: CustomColDef[];
  requestersDefs: CustomColDef[];
  inventoryItemsDefs: CustomColDef[];
  uomItemsDefs: CustomColDef[];
  attachmentsColDefs: CustomColDef[];
  budgetCodeColDefs: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParamsPrDetail: GridParams | undefined;
  listPurchaseRequestDetail;
  displayedData: InputPurchaseRequestLineDto[] = [];
  listInventoryGroup: GetMstInventoryGroupDto[] = [];
  selectedRowPrDetail;
  sumPrice: number = 0;
  currentIdPr: number = 0;
  currentInventoryId: number = 0;
  suppliers: SupplierOutputSelectDto[] = [];
  frameworkComponents;
  isLoading = false;
  selectedNode;
  inputPurchaseRequestHeaderDto: InputPurchaseRequestHeaderDto = new InputPurchaseRequestHeaderDto()
  inputSearchMstCurrency: InputSearchMstCurrency = new InputSearchMstCurrency()
  @Input() params: any;
  supplierId: number = 0;
  today = moment().startOf("days");
  listCreatePrForUr: any = [];
  listCreaPrForUrTemp: any = [];
  defaultColDef = {
    suppressMenu: true,
  };
  budgetCodeDefault: string;
  exchangeRate: CommonGetGlExchangeRateDto[] = [];

  uploadUrl: string = AppConsts.remoteServiceBaseUrl + '/AttachFile/UploadFileToFolder';
  removeUrl: string = AppConsts.remoteServiceBaseUrl + '/AttachFile/RemoveAttachFile';
  uploadData = [];
  fileName: string = '';
  formData: FormData = new FormData();
  processInfo: any[] = [];
  urlBase: string = AppConsts.remoteServiceBaseUrl;
  uploadDataParams: GridParams;
  selectedFileNode: RowNode;
  listFileAttachment = [];
  destinationTypeCode = undefined;
  status: string = '';

  //Distributions
  pRDistributionsForm: FormGroup;
  gridColDefDistributions: CustomColDef[];
  paginationParamsDistributions: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParamsDistributions: GridParams | undefined;
  selectedRowDistributions;
  displayedDataDistributions = [];
  selectedNodeDistributions;
  listPurchaseDistributions;
  frameworkComponentsDistributions;
  totalQuantityDistributions: number = 0;
  prLineRow;

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
    private mstCurrencyServiceProxy: MstCurrencyServiceProxy,
    private mstPurchasePurposeServiceProxy: MstPurchasePurposeServiceProxy,
    private mstPeriodServiceProxy: MstPeriodServiceProxy,
    private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
    private _http: HttpClient,
    private _fileApi: CommonLookupServiceProxy,
    private _approvalProxy: RequestApprovalTreeServiceProxy,
  ) {
    super(injector);
    this.frameworkComponents = {
      agDatepickerRendererComponent: AgDatepickerRendererComponent,
      agDropdownRendererComponent: AgDropdownRendererComponent,
      agCellButtonRendererComponent: AgCellButtonRendererComponent
    };

    //#region coldef
    this.gridColDefDetail = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 50,
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
      // {
      //   headerName: this.l('ItemDescription'),
      //   headerTooltip: this.l('ItemDescription'),
      //   field: 'itemDescription',
      //   cellClass: ['cell-clickable', 'cell-border'],
      //   editable: true,
      //   width: 200,
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
      //   cellClass: ['cell-border', 'text-right'],
      //   width: 100,
      //   valueGetter: params => this.dataFormatService.floatMoneyFormat((params.data.foreignPrice) ? params.data.foreignPrice : 0),
      // },
      {
        headerName: this.l('Price'),
        headerTooltip: this.l('Price'),
        field: 'unitPrice',
        cellClass: (params) => !params.data?.partNo ? ['cell-clickable', 'cell-border'] : ['cell-border'],
        editable: (params) => !params.data?.partNo,
        validators: ['required'],
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
        headerName: this.l('NeedByDate'),
        headerTooltip: this.l('NeedByDate'),
        field: 'needByDate',
        valueGetter: params => this.dataFormatService.dateFormat(params.data.needByDate),
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        width: 130,
        cellRenderer: 'agDatepickerRendererComponent'
      },
      {
        headerName: this.l('DestinationType'),
        headerTooltip: this.l('DestinationType'),
        field: 'destinationTypeCode',
        cellClass: ['cell-border', 'custom-grid-text', 'custom-grid-cbb-text', 'cell-clickable'],
        width: 80,
        validators: ['required'],
        cellRenderer: 'agDropdownRendererComponent',
        list: () => { return this.listDestinationType.map(e => Object.assign({}, { key: e.value, value: e.label })) },
      },
      {
        headerName: this.l('Requester'),
        headerTooltip: this.l('Requester'),
        field: 'requesterName',
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        validators: ['required'],
        width: 120,
        rowDrag: true,
      },
      {
        headerName: this.l('Organization'),
        headerTooltip: this.l('Organization'),
        field: 'destinationOrganizationId',
        cellClass: ['cell-border', 'custom-grid-text', 'custom-grid-cbb-text', 'cell-clickable'],
        width: 180,
        validators: ['required'],
        cellRenderer: 'agDropdownRendererComponent',
        list: () => { return this.listOrganization.map(e => Object.assign({}, { key: e.value, value: e.label })) },
      },
      {
        headerName: this.l('Location'),
        headerTooltip: this.l('Location'),
        field: 'locationCode',
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        validators: ['required'],
        width: 120,
        rowDrag: true,
      },
      {
        headerName: this.l('Supplier'),
        headerTooltip: this.l('Supplier'),
        field: 'suggestedVendorName',
        cellClass: ['cell-border'],
        editable: true,
        width: 200,
      },
      {
        headerName: this.l('Site'),
        headerTooltip: this.l('Site'),
        field: 'suggestedVendorLocation',
        cellClass: ['cell-border'],
        editable: true,
        width: 100,
      },
      {
        headerName: this.l('Subinventory'),
        headerTooltip: this.l('Subinventory'),
        field: 'destinationSubinventory',
        cellClass: ['cell-border'],
        editable: true,
        width: 120,
      },
      {
        headerName: this.l('BudgetCode'),
        headerTooltip: this.l('BudgetCode'),
        field: 'chargeAccount',
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
      // {
      //   headerName: this.l('BudgetAccount'),
      //   headerTooltip: this.l('BudgetAccount'),
      //   field: 'budgetAccount',
      //   cellClass: ['cell-border'],
      //   editable: true,
      //   validators: ['required'],
      //   width: 200,
      // },
      // {
      //   headerName: this.l('AccrualAccount'),
      //   headerTooltip: this.l('AccrualAccount'),
      //   field: 'accrualAccount',
      //   cellClass: ['cell-border'],
      //   editable: true,
      //   validators: ['required'],
      //   width: 200,
      // },
      // {
      //   headerName: this.l('VarianceAccount'),
      //   headerTooltip: this.l('VarianceAccount'),
      //   field: 'varianceAccount',
      //   cellClass: ['cell-border'],
      //   editable: true,
      //   validators: ['required'],
      //   width: 200,
      // },
      {
        headerName: this.l('More'),
        headerTooltip: this.l('More'),
        field: 'moreDistributions',
        cellClass: ['cell-border'],
        cellRenderer: 'agCellButtonRendererComponent',
        buttonDef: {
          text: this.l('More'),
          className: 'btn btn-outline-primary',
          function: this.openDistributions.bind(this),
        },
        width: 70,
      },
      {
        headerName: this.l('Remark'),
        headerTooltip: this.l('Remark'),
        field: 'attribute10',
        cellClass: ['cell-border'],
        editable: true,
        width: 200,
      },
      {
        headerName: this.l('Forecast'),
        headerTooltip: this.l('Forecast'),
        children: [
          {
            headerName: this.l('ForecastN'),
            headerTooltip: this.l('ForecastN'),
            field: 'attribute9',
            cellClass: ['cell-border'],
            width: 70,
            validators: ['floatNumber'],
            editable: true,
          },
          {
            headerName: this.l('ForecastN1'),
            headerTooltip: this.l('ForecastN1'),
            field: 'attribute12',
            cellClass: ['cell-border'],
            width: 70,
            validators: ['floatNumber'],
            editable: true,
          },
          {
            headerName: this.l('ForecastN2'),
            headerTooltip: this.l('ForecastN2'),
            field: 'attribute14',
            cellClass: ['cell-border'],
            width: 70,
            validators: ['floatNumber'],
            editable: true,
          },
          {
            headerName: this.l('ForecastN3'),
            headerTooltip: this.l('ForecastN3'),
            field: 'attribute15',
            cellClass: ['cell-border'],
            width: 70,
            editable: true,
          },
        ]
      }
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

    this.siteDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        flex: 30,
      },
      {
        headerName: this.l('VendorSiteCode'),
        headerTooltip: this.l('VendorSiteCode'),
        field: 'vendorSiteCode',
        flex: 400,
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
        field: 'unitOfMeasure',
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

    this.attachmentsColDefs = [
      {
        headerName: this.l('No.'),
        headerTooltip: this.l('No.'),
        cellRenderer: (params) => params.rowIndex + 1,
        cellClass: ['text-center'],
        maxWidth: 70
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
        valueFormatter: (params: ValueFormatterParams) => this.dataFormatService.dateTimeFormat(params.value),
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
  //#endregion
  ngOnInit(): void {
    this.buildFormPRHeaders();
    this.getRequesterInfo();
    this.listOrganization = [];
    this.listLineTypes = [];
    this.listInventoryGroups = [];
    this.listDestinationType = [];
    this.listPurchasePurpose = [];
    this.listCurrency = [];
    // this.getAllSupplier();
    this.mstOrganizationsServiceProxy.getAllOrganizations().subscribe((res) => {
      res.forEach(e => this.listOrganization.push({ label: e.name, value: e.id }))
      this.gridParamsPrDetail.api.redrawRows();
    });
    

    this.mstLineTypeServiceProxy.getAllLineTypes().subscribe((res) => {
      res.forEach(e => this.listLineTypes.push({ label: e.lineTypeCode, value: e.id }))
      this.gridParamsPrDetail?.api.redrawRows();
    });

    this.mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
      this.listInventoryGroup = res;
      res.forEach(e => this.listInventoryGroups.push({ label: e.productGroupName, value: e.id }))
    });

    this.commonGeneralCacheServiceProxy.getGlCombaination().subscribe((val) => {
      this.budgetCodeDefault = val.concatenatedSegments;
    });

    this.commonGeneralCacheServiceProxy.getAllCurrencies().subscribe((res) => {
      res.forEach(e => this.listCurrency.push({ label: e.currencyCode, value: e.currencyCode }))
    });

    this.listDestinationType.push({ label: 'Expense', value: 'EXPENSE' });
    this.listDestinationType.push({ label: 'Inventory', value: 'INVENTORY' });
    this.getAllPurchasePurpose();

    this.commonGeneralCacheServiceProxy.getGlExchangeRate('', '', this.createOrEditForm.get('rateDate').value)
      .subscribe(res => {
        this.exchangeRate = res;
      });

    setTimeout(() => {
      if (this.params.selectedUserRequests) {
        this.createOrEditForm.get('inventoryGroupId').setValue(this.params.selectedUserRequests[0].inventoryGroupId);
        this.listCreatePrForUr = this.params.selectedUserRequests;
        this.params.selectedUserRequests.forEach(e => {

          this.listCreaPrForUrTemp.push({
            lineTypeId: 1,
            id: 0,
            partNo: e.partNo,
            partName: e.partName,
            quantity: e.quantity,
            urLineId: e.id,
            uom: e.uom,
            unitMeasLookupCode: e.uom,
            unitPrice: e.unitPrice,
            category: e.category,
            categoryId: e.categoryId,
            itemId: e.productId,
            needByDate: e.needByDate ?? new Date(),
            amount: e.amount,

            chargeAccount: e.budgetCode,
            glDate: new Date(),
            budgetAccount: e.budgetCode,
            accrualAccount: e.budgetCode,
            varianceAccount: e.budgetCode,

            destinationTypeCode: 'INVENTORY',
            destinationOrganizationId: e.destinationOrganizationId ?? 81,
            requesterName: e.requesterName,
            toPersonId: e.requesterId,
            locationCode: e.locationCode,
            deliverToLocationId: e.deliverToLocationId,
            destinationSubinventory: e.destinationSubinventory,
            sourceTypeCode: 'Supplier',
            suggestedVendorName: e.suggestedVendorName,
            vendorId: e.vendorId,
            suggestedVendorLocation: e.suggestedVendorLocation,
            vendorSiteId: e.vendorSiteId,
            phoneSupplier: undefined,
            // faxSupplier: undefined,
            // emailSupplier: undefined,
            // addressSupplier: undefined,
            // suggestedVendorContact: undefined,
            // suggestedVendorPhone: undefined,
          });
        });
        this.gridParamsPrDetail.api.setRowData(this.listCreaPrForUrTemp);
      }
      if (this.params?.purchaseRequestId && this.params?.purchaseRequestId > 0) {
        this.currentIdPr = this.params?.purchaseRequestId;
        this.getPurchaseRequestEdit(this.params?.purchaseRequestId);
      }
    }, 500);
  }

  // getAllChargeAccount() {

  // }

  getAllChargeAccount(budgetCode: string, paginationParams: PaginationParamsModel) {
    return this.commonGeneralCacheServiceProxy.getAllGlCodeCombinations(
      budgetCode ?? '',
      paginationParams ? paginationParams.sorting : '',
      paginationParams ? paginationParams.pageSize : 20,
      paginationParams ? paginationParams.skipCount : 0
    );
  }

  getAllPurchasePurpose() {
    this.spinnerService.show();
    this.listPurchasePurpose = [];
    this.listPurchasePurpose.unshift({
      label: '',
      value: undefined
    });
    this.commonGeneralCacheServiceProxy.getAllPurchasePurpose()
      .pipe(finalize(() => this.spinnerService.hide()))
      .subscribe(res => res.map(e => this.listPurchasePurpose.push({
        label: e.purchasePurposeName,
        value: e.id
      })));
  }

  getPurchaseRequestEdit(id: number) {
    this.spinnerService.show();
    this.purchaseRequestServiceProxy.getPurchaseRequestById(id).subscribe((result) => {
      this.createOrEditForm.patchValue(result);
      this.status = result.authorizationStatus;
      this.createOrEditForm.get('authorizationStatus').setValue(this.handleStatus(result.authorizationStatus));
      this.currentInventoryId = result.inventoryGroupId;
      this.gridParamsPrDetail.api.setRowData(result.getPurchaseRequestLineForEditDtos);
      this.uploadDataParams?.api.setRowData(result.attachments);
      this.uploadData = result.attachments ?? [];
      // result.getPurchaseRequestLineForEditDtos.forEach(e => {

      //   this.addRow();
      //   this.setDataRow(e);
      // });
      // this.gridParamsPrDetail.api.sizeColumnsToFit();
      this.spinnerService.hide();
    });
  }

  getRequesterInfo() {
    this.spinnerService.show();
    this.requester = new GetRequesterInfoForViewDto();
    this.commonGeneralCacheServiceProxy.getRequesterInfo(abp.session.userId)
      .pipe(finalize(() => this.spinnerService.hide()))
      .subscribe(res => {
        this.requester = res;
        this.createOrEditForm.get('department').setValue(res.departmentName);
        this.createOrEditForm.get('division').setValue(res.userTitle);
        // this.createOrEditForm.get('email').setValue(res.);
      });
  }

  //#region patch
  patchSupplier(event: any) {
    this.supplierId = event.id ?? 0;
    this.selectedNode.data.vendorId = event.id;
    this.selectedNode.data.suggestedVendorName = event.supplierName;
    this.gridParamsPrDetail.api.applyTransaction({ update: [this.selectedNode.data] });
    // this.formPRLines.get('vendorId').setValue(event.id);
    // this.formPRLines.get('suggestedVendorName').setValue(event.supplierName);
  }

  patchCategory(event: any) {
    this.selectedNode.data.category = event.segment1 + '.' + event.segment2;
    this.selectedNode.data.categoryId = event.id;
    this.gridParamsPrDetail.api.applyTransaction({ update: [this.selectedNode.data] });
  }

  patchSite(event: any) {
    this.selectedNode.data.suggestedVendorLocation = event.vendorSiteCode;
    this.selectedNode.data.vendorSiteId = event.id;
    this.gridParamsPrDetail.api.applyTransaction({ update: [this.selectedNode.data] });
    // this.formPRLines.get('addressSupplier').setValue(event.addressLine1);
    // this.formPRLines.get('suggestedVendorLocation').setValue(event.vendorSiteCode);
    // this.formPRLines.get('vendorSiteId').setValue(event.id);
  }

  patchLocation(event: any) {
    this.selectedNode.data.locationCode = event.locationCode;
    this.selectedNode.data.deliverToLocationId = event.id;
    this.gridParamsPrDetail.api.applyTransaction({ update: [this.selectedNode.data] });
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    this.gridParamsPrDetail.api.startEditingCell({ colKey: 'suggestedVendorName', rowIndex });
  }

  patchInventoryItems(event: any) {
    const fieldToCheck = { name: this.l('PartNo'), field: 'partNo' };
    // if (this.agDataValidateService.checkDuplicateData(event, this.displayedData, fieldToCheck)) {
    let exchangeRate: number = 1;
    this.selectedNode.data.partNo = event.partNo;
    this.selectedNode.data.partName = event.partName;
    this.selectedNode.data.uom = event.primaryUnitOfMeasure;
    this.selectedNode.data.unitMeasLookupCode = event.primaryUnitOfMeasure;
    this.selectedNode.data.foreignPrice = event.unitPrice;
    if (this.exchangeRate.length > 0) {
      const rateFilter = this.exchangeRate.filter(excRate => excRate.fromCurrency === event.currencyCode
        && excRate.toCurrency === this.createOrEditForm.get('currencyCodeTotal').value
      );
      exchangeRate = rateFilter[0]?.conversionRate ?? 1;
      this.selectedNode.data.unitPrice = (event.unitPrice * exchangeRate);
    } else {
      this.selectedNode.data.unitPrice = event.unitPrice;
    }
    this.selectedNode.data.quantity = 0;
    this.selectedNode.data.itemId = event.id;
    this.selectedNode.data.currencyCode = event.currencyCode;
    this.selectedNode.data.requesterName = this.appSession.user.name;
    this.selectedNode.data.toPersonId = this.appSession.userId;
    this.selectedNode.data.destinationTypeCode = event.destinationTypeCode;
    this.selectedNode.data.suggestedVendorName = event.supplierName;
    this.selectedNode.data.vendorId = event.supplierId;
    this.gridParamsPrDetail.api.applyTransaction({ update: [this.selectedNode.data] });
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    this.gridParamsPrDetail.api.startEditingCell({ colKey: 'quantity', rowIndex });
    // this.listOrganization = [];
    // this.commonGeneralCacheServiceProxy.getListOrgzationsByPartNo(event.partNo).subscribe((res) => {
    //   res.forEach(e => {
    //     this.listOrganization.push({ label: e.name, value: e.id });
    //     this.gridParamsPrDetail.api.redrawRows();

    //   })
    // });
    // }
  }

  patchUOM(event: any) {
    this.selectedNode.data.uom = event.unitOfMeasure;
    this.selectedNode.data.unitMeasLookupCode = event.unitOfMeasure;
    this.gridParamsPrDetail.api.applyTransaction({ update: [this.selectedNode.data] });
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    this.gridParamsPrDetail.api.startEditingCell({ colKey: 'requesterName', rowIndex });
  }

  patchRequester(event: any) {
    this.selectedNode.data.requesterName = event.name;
    this.selectedNode.data.toPersonId = event.id;
    this.gridParamsPrDetail.api.applyTransaction({ update: [this.selectedNode.data] });
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    this.gridParamsPrDetail.api.startEditingCell({ colKey: 'destinationOrganizationId', rowIndex });
  }

  patchBudgetCode(event: any) {
    this.selectedNode.data.chargeAccount = event.concatenatedSegments;
    this.selectedNode.data.budgetAccount = event.concatenatedSegments;
    this.selectedNode.data.accrualAccount = event.concatenatedSegments;
    this.selectedNode.data.varianceAccount = event.concatenatedSegments;
    this.gridParamsPrDetail.api.applyTransaction({ update: [this.selectedNode.data] });
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    this.gridParamsPrDetail.api.startEditingCell({ colKey: 'glDate', rowIndex });
  }

  patchChargeAccount(event: any) {
    this.createOrEditForm.get('chargeAccount').setValue(event.concatenatedSegments);
  }

  //#endregion

  //#region buildform
  buildFormPRHeaders() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      requisitionNo: [undefined],
      preparerId: [undefined],
      prepareName: [this.appSession.user.name],
      division: [undefined],
      authorizationStatus: [this.handleStatus('INCOMPLETE')],
      email: [undefined],
      department: [undefined],
      description: [undefined],
      inventoryGroupId: [undefined],
      totalPrice: [0],
      prName: [undefined],
      purchasePurposeId: [undefined],
      costCenter: [undefined],
      chargeAccount: [undefined],
      rateDate: new Date(),
      documentType: ['Purchase request'],
      currencyCodeTotal: ['VND'],
      originalCurrencyCode: ['VND'],
    });
  }
  //#endregion

  closeModel() {
    this.modal.hide();
  }

  reset() {
    this.createOrEditForm = undefined;
  }

  save() {
    const obj = Object.assign({}, this.createOrEditForm.getRawValue(), this.displayedData)
    this.isSubmit = true;
    if (this.submitBtn) {
      this.submitBtn.nativeElement.click();
    }
    if (this.createOrEditForm.invalid) {
      return;
    }
  }

  cellValueChanged(params: AgCellEditorParams) {
    const field = params.colDef.field;
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    this.selectedNode = params.node;
    switch (field) {
      case 'lineTypeId':
        if (field === 'lineTypeId') {
          if (params.data[field] === 1) {
            this.gridParamsPrDetail.api.startEditingCell({ colKey: 'partNo', rowIndex });
          } else {
            params.data['partNo'] = '';
            this.gridParamsPrDetail.api.startEditingCell({ colKey: 'partName', rowIndex });
          }
        }
        break;
      case 'itemDescription':
        this.gridParamsPrDetail.api.startEditingCell({ colKey: 'quantity', rowIndex });
        break;
      case 'quantity':
        if (Number(params.data['quantity']) < 0) {
          this.notify.warn(this.l('QuanityGreatZero'));
          this.gridParamsPrDetail.api.startEditingCell({ colKey: 'quantity', rowIndex });
          return;
        }
        params.data['amount'] = Math.round(Number(params.data['quantity'] ?? 0) * Number(params.data['unitPrice'] ?? 0) * 100) / 100;
        // this.gridParamsPrDetail.api.startEditingCell({ colKey: 'needByDate', rowIndex });
        break;
      case 'unitPrice':
        if (Number(params.data['unitPrice']) < 0) {
          this.notify.warn(this.l('PriceGreatZero'));
          this.gridParamsPrDetail.api.startEditingCell({ colKey: 'unitPrice', rowIndex });
          return;
        }
        params.data['amount'] = Math.round(Number(params.data['quantity'] ?? 0) * Number(params.data['unitPrice'] ?? 0) * 100) / 100;
        break;
      case 'needByDate':
        const timeNow = new Date().getTime();
        if (params.data['needByDate'] < timeNow) {
          this.notify.warn(this.l('NeedByDateGreatToday'))
        }
        break;
      case 'glDate':
        if (params.data['glDate']) {
          this.mstPeriodServiceProxy.checkGlDate(params.data['glDate'])
            .subscribe((val) => {
              if (!val) {
                this.notify.warn(this.l('GLDateCannotPeriod'))
              }
            });
        }
        break;
      case 'chargeAccount':
        this.purchaseRequestServiceProxy.checkAccountDistributions(params.data[field]).subscribe((val) => {
          if (!val) {
            this.gridParamsPrDetail.api.startEditingCell({ colKey: 'chargeAccount', rowIndex });
            this.notify.warn(this.l('AccountNotValid'))
          }
        });
        break;
      // case 'budgetAccount':
      //   this.purchaseRequestServiceProxy.checkAccountDistributions(params.data[field]).subscribe((val) => {
      //     if (!val) {
      //       this.gridParamsPrDetail.api.startEditingCell({ colKey: 'budgetAccount', rowIndex });
      //       this.notify.warn(this.l('AccountNotValid'))
      //     }
      //   });
      //   break;
      // case 'accrualAccount':
      //   this.purchaseRequestServiceProxy.checkAccountDistributions(params.data[field]).subscribe((val) => {
      //     if (!val) {
      //       this.gridParamsPrDetail.api.startEditingCell({ colKey: 'accrualAccount', rowIndex });
      //       this.notify.warn(this.l('AccountNotValid'))
      //     }
      //   });
      //   break;
      // case 'varianceAccount':
      //   this.purchaseRequestServiceProxy.checkAccountDistributions(params.data[field]).subscribe((val) => {
      //     if (!val) {
      //       this.gridParamsPrDetail.api.startEditingCell({ colKey: 'varianceAccount', rowIndex });
      //       this.notify.warn(this.l('AccountNotValid'))
      //     }
      //   });
      // break;
    }
    this.getDisplayedData();
    this.gridParamsPrDetail.api.refreshCells();
  }

  callBackGridPrDetail(params: GridParams) {
    this.gridParamsPrDetail = params;
    params.api.setRowData(this.listCreaPrForUrTemp);
    this.addRow(false);
  }

  getDisplayedData() {
    this.displayedData = this.gridTableService.getAllData(this.gridParamsPrDetail);
    this.calculateTotalPrice();
  }

  validateBeforeAddRow() {

    const inventoryGroupId = this.createOrEditForm.get('inventoryGroupId').value;
    if (!inventoryGroupId || inventoryGroupId === 0) {
      this.notify.warn(this.l('EnterInventoryGroupBeforeAddLine'))
      return;
    }
    return this.agDataValidateService.validateDataGrid(this.gridParamsPrDetail, this.gridColDefDetail, this.displayedData);
  }

  //#region api get list
  getAllSupplier(suplierName: any, paginationParams: PaginationParamsModel) {
    return this.mstSupplierServiceProxy.getAllSupplierNotPaged(
      suplierName ?? ''
    );
  }

  getAllCategories(categoriesName: any, paginationParams: PaginationParamsModel) {
    return this.mstCategoriesServiceProxy.getAllCategoties(categoriesName ?? '');
  }

  getAllSites(siteName: any, paginationParams: PaginationParamsModel) {
    return this.mstSupplierServiceProxy.getAllSupplierSiteBySupplierIdNotPaged(this.supplierId, siteName);
  }

  getAllLocations(locationCode: any, paginationParams: PaginationParamsModel) {
    return this.mstLocationsServiceProxy.getAllLocations(locationCode)
  }

  getAllInventoryItems(partNo: any, paginationParams: PaginationParamsModel) {
    return this.commonGeneralCacheServiceProxy.getAllInventoryItemsByGroup(
      this.createOrEditForm.get('inventoryGroupId').value,
      undefined,
      this.createOrEditForm.get('originalCurrencyCode').value,
      partNo,
      this.createOrEditForm.get('rateDate').value
    )
  }

  getAllUOM(unitOfMeasure: any, paginationParams: PaginationParamsModel) {
    return this.mstUnitOfMeasureServiceProxy.getAllUmoNotPaged(unitOfMeasure, '', '');
  }

  getAllRequesters(userName: any, paginationParams: PaginationParamsModel) {
    return this.purchaseRequestServiceProxy.getListRequester(userName,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1));
  }

  getAllGlCode(budgetCode: string, paginationParams: PaginationParamsModel) {
    return this.commonGeneralCacheServiceProxy.getAllGlCodeCombinations(
      budgetCode ?? '',
      paginationParams ? paginationParams.sorting : '',
      paginationParams ? paginationParams.pageSize : 20,
      paginationParams ? paginationParams.skipCount : 0
    );
  }
  //#endregion

  //#region row grid
  addRow(isValidate: boolean) {

    if (isValidate) {
      if (!this.validateBeforeAddRow()) {
        return;
      }
    }

    const blankProduct = {
      stt: this.displayedData.length + 1,
      lineTypeId: 1,
      id: 0,
      partNo: undefined,
      partName: undefined,
      quantity: undefined,
      // unit: undefined,
      uom: undefined,
      unitMeasLookupCode: undefined,
      unitPrice: 0,
      foreignPrice: 0,
      category: undefined,
      subCategory: undefined,
      categoryId: undefined,
      itemId: undefined,
      needByDate: undefined,
      amount: 0,
      attribute9: undefined,
      attribute12: undefined,
      attribute14: undefined,
      attribute15: undefined,

      chargeAccount: undefined,
      glDate: new Date(),
      budgetAccount: undefined,
      accrualAccount: undefined,
      varianceAccount: undefined,
      distributionsId: 0,
      urLineId: undefined,

      destinationTypeCode: this.destinationTypeCode,
      destinationOrganizationId: 81,
      requesterName: this.appSession.user.name,
      toPersonId: this.appSession.userId,
      locationCode: undefined,
      deliverToLocationId: 0,
      destinationSubinventory: undefined,
      sourceTypeCode: 'Supplier',
      suggestedVendorName: undefined,
      vendorId: undefined,
      suggestedVendorLocation: undefined,
      vendorSiteId: undefined,
      phoneSupplier: undefined,
      faxSupplier: undefined,
      emailSupplier: undefined,
      addressSupplier: undefined,
      suggestedVendorContact: undefined,
      suggestedVendorPhone: undefined,
    }

    this.gridParamsPrDetail.api.applyTransaction({ add: [blankProduct] });
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    setTimeout(() => {
      this.gridParamsPrDetail.api.startEditingCell({ colKey: 'partNo', rowIndex });
      this.selectedNode = this.gridParamsPrDetail.api.getRowNode(`${rowIndex}`);
      this.gridParamsPrDetail.api.getRowNode(`${rowIndex}`).setSelected(true);
    }, 100);
    this.getDisplayedData();
  }

  setDataRow(rowData: GetPurchaseRequestLineForEditDto) {
    const fieldToCheck = { name: 'Inventory item', field: 'partNo' };
    const rowIndex = this.displayedData.indexOf(this.selectedRowPrDetail);
    const val = {
      stt: this.displayedData.length,
      id: rowData.id,
      lineTypeId: rowData.lineTypeId,
      partNo: rowData.partNo,
      partName: rowData.partName,
      quantity: rowData.quantity,
      // unit: undefined,
      uom: rowData.uom,
      unitMeasLookupCode: rowData.uom,
      unitPrice: rowData.unitPrice,
      category: rowData.category,
      subCategory: undefined,
      categoryId: rowData.categoryId,
      itemId: rowData.itemId,
      needByDate: rowData.needByDate,
      amount: rowData.unitPrice * rowData.quantity,
      forcastN: undefined,
      forcastN1: undefined,
      forcastN2: undefined,
      forcastN3: undefined,

      destinationTypeCode: rowData.destinationTypeCode,
      destinationOrganizationId: rowData.destinationOrganizationId,
      requesterName: rowData.requesterName,
      toPersonId: rowData.toPersonId,
      locationCode: rowData.locationCode,
      deliverToLocationId: rowData.deliverToLocationId,
      destinationSubinventory: rowData.destinationSubinventory,
      sourceTypeCode: 'Supplier',
      suggestedVendorName: rowData.suggestedVendorName,
      vendorId: rowData.vendorId,
      suggestedVendorLocation: rowData.suggestedVendorLocation,
      vendorSiteId: rowData.vendorSiteId,
      phoneSupplier: undefined,
      faxSupplier: undefined,
      emailSupplier: undefined,
      addressSupplier: rowData.addressSupplier,
      suggestedVendorContact: rowData.suggestedVendorContact,
      suggestedVendorPhone: rowData.suggestedVendorPhone,
      listDistributions: rowData.listDistributions
    };

    this.gridTableService.setDataToRow(this.gridParamsPrDetail, (rowIndex + 1), val, this.displayedData, 'needByDate');
    this.selectedRowPrDetail = val;
    // this.formPRLines.patchValue(this.selectedRowPrDetail);
    this.getDisplayedData();
  }
  //#endregion

  onChangeInventoryGroup(event: any) {
    // this.currentInventoryId = this.createOrEditForm.value.inventoryGroupId;
    // console.log(this.createOrEditForm.get('inventoryGroupId').value);
    // console.log(this.listInventoryGroup.filter(e => e.id == this.createOrEditForm.get('inventoryGroupId').value)[0].isInventory);
    this.destinationTypeCode = this.listInventoryGroup.filter(e => e.id == this.createOrEditForm.get('inventoryGroupId').value)[0].isInventory === true ? 'INVENTORY' : 'EXPENSE';
    if (this.currentInventoryId && event && this.currentInventoryId !== event && this.displayedData.length > 0) {
      this.message.confirm(this.l('WarrningChangingInventoryGroup'), this.l('AreYouSure'), (isConfirmed) => {
        if (isConfirmed) {
          this.displayedData = [];
          this.gridParamsPrDetail.api.setRowData(this.displayedData);
          this.currentInventoryId = this.createOrEditForm.value.inventoryGroupId;
          this.destinationTypeCode = this.listInventoryGroup.filter(e => e.id == this.createOrEditForm.get('inventoryGroupId').value)[0].isInventory ? 'INVENTORY' : 'EXPENSE';
        } else {
          this.createOrEditForm.patchValue({ inventoryGroupId: this.currentInventoryId })
        }
      });
    } else {
      this.currentInventoryId = event;
    }

  }

  agKeyUp(event: KeyboardEvent) {
    event.stopPropagation();
    // Press enter to search with modal
    if (event.key === 'ArrowDown') this.addRow(true);
  }

  showChargeAccount() {
    this.selectChargeAccount.show(this.createOrEditForm.get('chargeAccount').value);
  }

  removeSelectedRow() {
    if (!this.selectedRowPrDetail) {
      this.notify.warn(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete);
      return;
    }
    this.gridParamsPrDetail.api.applyTransaction({ remove: [this.selectedNode.data] })
    this.selectedRowPrDetail = undefined;
    this.getDisplayedData();
  }

  onChangeSelectionPrDetail(params) {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowPrDetail = selectedRows[0];
    }
    this.selectedNode = this.gridParamsPrDetail.api.getSelectedNodes()[0] ?? [];
    this.gridParamsPrDetail.api.getRowNode(`${this.selectedNode.rowIndex}`)?.setSelected(true);
    // this.formPRLines.patchValue(this.selectedRowPrDetail);
  }

  calculateTotalPrice() {
    let sumTotal = 0;
    this.gridTableService.getAllData(this.gridParamsPrDetail).forEach((val) => {
      sumTotal += Number(val.amount);
      this.createOrEditForm.get('totalPrice').setValue(this.dataFormatService.formatMoney(sumTotal));
    });
  }

  cellEditingStopped(params: AgCellEditorParams) {
    const col = params.colDef.field;
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    switch (col) {
      case 'lineTypeId':
        if (params.data[col] === 1) {
          this.gridParamsPrDetail.api.startEditingCell({ colKey: 'partNo', rowIndex });
        }
        break;
      case 'needByDate':
        if (params.data[col] && params.data[col] < moment()) {
          this.gridParamsPrDetail.api.startEditingCell({ colKey: 'needByDate', rowIndex });
          this.notify.warn(this.l('CannotLessThanCurrentDate'));
        }
        break;
      case 'unitPrice':
        params.data['foreignPrice'] = params.data['unitPrice'];
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
        const inventoryGroupId = this.createOrEditForm.get('inventoryGroupId').value;
        if (!inventoryGroupId || inventoryGroupId === 0) {
          this.notify.warn(this.l('EnterInventoryGroupBeforeAddLine'))
          return;
        }
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
      case 'requesterName':
        this.listRequester.show(
          params.data?.requesterName ?? '',
          undefined,
          undefined,
          'requesterName'
        );
        break;
      case 'locationCode':
        this.listLocation.show(
          params.data?.locationCode ?? '',
          undefined,
          undefined,
          'locationCode'
        );
        break;
      case 'suggestedVendorName':
        this.listSupplierPopup.show(
          params.data?.suggestedVendorName ?? '',
          undefined,
          undefined,
          'suggestedVendorName'
        );
        break;
      case 'suggestedVendorLocation':
        this.listSite.show(
          params.data?.suggestedVendorLocation ?? '',
          undefined,
          undefined,
          'suggestedVendorLocation'
        );
        break;
      case 'chargeAccount':
        this.selectBudgetCodeHeadModal.show(
          params.data?.chargeAccount ?? '',
          undefined,
          undefined,
          'chargeAccount'
        );
        break;
    }
  }

  setLoading(params) {
    this.isLoading = params;
  }

  createPr() {
    if (this.displayedData.length && this.displayedData.length <= 0) {
      this.notify.warn(this.l('ListItemsEmpty'));
      return;
    }

    if (!this.createOrEditForm.get('chargeAccount').value) {
      this.notify.warn(this.l('CannotBeEmpty', this.l('BudgetCode')));
      return;
    }

    if (!this.validateBeforeAddRow()) {
      return;
    }

    let listLines = [];
    // if(this.displayedData.listDistributions && this.displayedData.listDistributions.length > 0)
    this.displayedData.forEach(e => {
      if (e.listDistributions && e.listDistributions.length > 0) {
        listLines.push(e);
      } else {
        e.listDistributions = undefined;
        listLines.push(Object.assign(e, {
          listDistributions: [new GetPurchaseRequestDistributionsDto(
            {
              id: e.distributionsId ?? 0,
              quantity: e.quantity,
              glDate: e.glDate,
              budgetAccount: e.budgetAccount,
              accrualAccount: e.accrualAccount,
              varianceAccount: e.varianceAccount,
              chargeAccount: e.chargeAccount,
              recoverRate: undefined
            })
          ]
        }));
      }
    });
    this.inputPurchaseRequestHeaderDto = Object.assign(this.createOrEditForm.getRawValue(), {
      inputPurchaseRequestLineDtos: listLines
    });
    this.spinnerService.show();
    this.purchaseRequestServiceProxy.createPurchaseRequest(this.inputPurchaseRequestHeaderDto)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((val) => {
        this.currentIdPr = val;
        if (this.uploadData.length > 0) {
          const listUpload = this.uploadData.filter(u => !u.id);
          this.saveUpload(listUpload, val);
        } else {
          this.getPurchaseRequestEdit(val);
        }
        // let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
        //   reqId: val,
        //   processTypeCode: 'PR'
        // })
        // this._approvalProxy.createRequestApprovalTree(body)
        //   .pipe(finalize(() => {
        //     this.spinnerService.hide();
        //   }))
        //   .subscribe(res => this.notify.success(this.l('SavedSuccessfully')))
        this.notify.success(this.l('SavedSuccessfully'));
      });
  }

  count = 0;
  saveUpload(params: any[], reqId: any) {
    this.spinnerService.show();
    var e = params.find((e, i) => i == this.count)
    if (e) {
      this._http
        .post<any>(this.uploadUrl, e.file, {
          params: {
            type: 'PR',
            serverFileName: e.serverFileName,
            headerId: reqId,
            originalFileName: e.originalFileName
          }
        })
        .pipe(finalize(() => {
          this.count++;
          this.saveUpload(params, reqId);
        }))
        .subscribe();
    }
    else {
      this.spinnerService.hide();
      this.count = 0;
      this.refreshFile();
      this.getPurchaseRequestEdit(reqId);
    }
  }

  //#endregion
  openDistributions(param: any) {
    if (this.displayedData.length && this.displayedData.length <= 0) {
      this.notify.warn(this.l('ListItemsEmpty'));
      return;
    }

    if (!this.validateBeforeAddRow()) {
      return;
    }

    this.prDistributions.open(this.selectedRowPrDetail);
  }

  pathDistributions(event: Event) {
    this.selectedNode.data = event;
    this.getDisplayedData();
  }

  deleteFile() {
    if (this.selectedFileNode.data?.id) {
      this.message.confirm(this.l('AreYouSure'), this.l('DeleteThisSelection'), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this.uploadDataParams?.api.applyTransaction({ remove: [this.selectedFileNode.data] });
          this._fileApi.deleteAttachFile(this.selectedFileNode.data?.id)
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => {
              this._http
                .get(this.removeUrl, {
                  params: { "attachFile": this.selectedFileNode.data?.serverFileName, "rootPath": this.selectedFileNode.data?.rootPath }, responseType: 'blob'
                })
                .subscribe(res => this.notify.success(this.l('SuccessfullyDeleted')));
            });
          this.uploadData = this.gridTableService.getAllData(this.uploadDataParams);
          // this.selectedRowPrDetail.attachments = this.gridTableService.getAllData(this.uploadDataParams);
        }
      })
    }
    else {
      this.uploadDataParams?.api.applyTransaction({ remove: [this.selectedFileNode.data] });
      this.uploadData = this.gridTableService.getAllData(this.uploadDataParams);
      // this.selectedRowPrDetail.attachments = this.gridTableService.getAllData(this.uploadDataParams);
    }
  }

  refreshFile() {
    this.uploadData = [];
    this.uploadDataParams.api?.setRowData([]);
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
    // this.uploadData = [];
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
        }))
      })
      this.uploadDataParams?.api.setRowData(this.uploadData);
    }
  }

  callBackFileGrid(params: GridParams) {
    this.uploadDataParams = params;
    this.uploadDataParams.api.setRowData(this.uploadData);
  }

  onChangeFileSelection(params: any) {
    const selectedNode = params.api.getSelectedNodes()[0];
    if (selectedNode) this.selectedFileNode = selectedNode;
  }

  changeCurrency() {
    // let exchangeRate: number = 1;
    // if (this.exchangeRate.length > 0) {
    //   this.gridParamsPrDetail.api.forEachNode(node => {
    //     const rateFilter = this.exchangeRate.filter(excRate => excRate.fromCurrency === node.data.currencyCode
    //       && excRate.toCurrency === this.createOrEditForm.get('originalCurrencyCode').value
    //     );
    //     exchangeRate = rateFilter[0]?.conversionRate ?? 1;
    //     node.data.unitPrice = (node.data.foreignPrice * exchangeRate);
    //     node.data.amount = node.data.unitPrice * node.data.quantity;
    //     this.gridParamsPrDetail.api.applyTransaction({ update: [node.data] });
    //   });
    // }
    // this.getDisplayedData();

  }

  sendRequest() {

    if (!this.validateBeforeAddRow()) {
      return;
    }

    this.viewDetailApprove.showModal(this.currentIdPr, 'PR');

    // let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
    //   reqId: this.currentIdPr,
    //   processTypeCode: 'PR'
    // })
    // this.message.confirm(this.l('AreYouSure'), this.l('SendRequestApprove'), (isConfirmed) => {
    //   if (isConfirmed) {
    //     this.spinnerService.show();
    //     this._approvalProxy.requestNextApprovalTree(body)
    //       .pipe(finalize(() => {
    //         this.spinnerService.hide();
    //         this.getPurchaseRequestEdit(this.currentIdPr);
    //       }))
    //       .subscribe(res => this.notify.success(this.l('Successfully')))
    //   }
    // })
  }


  handleStatus(status: string) {
    switch (status) {
      case 'NEW':
        return this.l('New');
      case 'INCOMPLETE':
        return this.l('New');
      case 'PENDING':
        return this.l('Pending');
      case 'WAITTING':
        return this.l('Approved');
      case 'APPROVED':
        return this.l('Approved');
      case 'REJECTED':
        return this.l('Rejected');
    }
  }

  changeDocumentDate(e: Event) {
    this.commonGeneralCacheServiceProxy.getGlExchangeRate('', '', this.createOrEditForm.get('rateDate').value)
      .subscribe(res => {
        this.exchangeRate = res;

        let exchangeRate: number = 1;
        if (this.exchangeRate.length > 0) {
          this.gridParamsPrDetail.api.forEachNode(node => {
            const rateFilter = this.exchangeRate.filter(excRate => excRate.fromCurrency === node.data.currencyCode
              && excRate.toCurrency === this.createOrEditForm.get('originalCurrencyCode').value
            );
            exchangeRate = rateFilter[0]?.conversionRate ?? 1;
            node.data.unitPrice = (node.data.foreignPrice * exchangeRate);
            node.data.amount = node.data.unitPrice * node.data.quantity;
            this.gridParamsPrDetail.api.applyTransaction({ update: [node.data] });
          });
        }
        this.getDisplayedData();
      });
  }
  //#endregion
}
