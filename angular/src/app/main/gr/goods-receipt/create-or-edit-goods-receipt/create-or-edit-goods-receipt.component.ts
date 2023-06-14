import { ICellEditorParams, ICellRendererParams, RowNode, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgCheckboxRendererComponent } from '@app/shared/common/grid-input-types/ag-checkbox-renderer/ag-checkbox-renderer.component';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { TABS } from '@app/shared/constants/tab-keys';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AgDataValidateService } from '@app/shared/services/ag-data-validate.service';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, CreateRequestApprovalInputDto, ExpectedReceiptsDto, GetRcvReceiptNoteLineForEditDto, InputRcvShipmentHeadersDto, MstCategoriesServiceProxy, MstInventoryGroupServiceProxy, MstInventoryItemsServiceProxy, MstInventoryItemSubInventoriesServiceProxy, MstLineTypeServiceProxy, MstLocationsServiceProxy, MstOrganizationsServiceProxy, MstSupplierServiceProxy, MstUnitOfMeasureServiceProxy, PaymentHeadersServiceProxy, PurchaseRequestServiceProxy, RcvReceiptNoteHeadersServiceProxy, RcvShipmentAttachmentsDto, RcvShipmentHeadersServiceProxy, RequestApprovalTreeServiceProxy, SupplierOutputSelectDto } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { Console } from 'console';
import * as saveAs from 'file-saver';
import { ceil } from 'lodash-es';
import { DateTime } from 'luxon';
import * as moment from 'moment';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'create-or-edit-goods-receipt',
  templateUrl: './create-or-edit-goods-receipt.component.html',
  styleUrls: ['./create-or-edit-goods-receipt.component.less']
})
export class CreateOrEditGoodsReceiptComponent extends AppComponentBase implements OnInit {
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('listSupplierPopup', { static: true }) listSupplierPopup!: TmssSelectGridModalComponent;
  @ViewChild('listCategory', { static: true }) listCategory!: TmssSelectGridModalComponent;
  @ViewChild('listSite', { static: true }) listSite!: TmssSelectGridModalComponent;
  @ViewChild('listLocation', { static: true }) listLocation!: TmssSelectGridModalComponent;
  @ViewChild('listInventoryItems', { static: true }) listInventoryItems!: TmssSelectGridModalComponent;
  @ViewChild('listUOM', { static: true }) listUOM!: TmssSelectGridModalComponent;
  @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
  @ViewChild('listAllPOs', { static: true }) listAllPOs!: TmssSelectGridModalComponent;
  @Output() close = new EventEmitter<any>();
  searchForm: FormGroup;
  createOrEditForm: FormGroup;
  isEdit = true;
  isSubmit = false;
  listInventoryGroups: { label: string, value: string | number }[] = [];
  listSupplier: { label: string, value: string | number }[] = [];
  siteListAll: { supplierId: number, id: number, vendorSiteCode: string }[] = [];
  siteList: { label: string, value: string | number }[] = [{ value: -1, label: 'Tất cả' }];
  listLocationCombo: { value: string | number, key: string | number }[] = [];
  listSubInventories: { value: string, key: string | number }[] = []
  listDocument: { label: string, value: string | number }[] = [];
  // listOrganization: { label: string, value: string | number }[] = [];
  // listLineTypes: { label: string, value: string | number }[] = [];

  gridColDefDetail: CustomColDef[];
  supplierDefs: CustomColDef[];
  categoryDefs: CustomColDef[];
  siteDefs: CustomColDef[];
  locationDefs: CustomColDef[];
  uomItemsDefs: CustomColDef[];
  gridPOsDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParamsPrDetail: GridParams | undefined;
  gridParamsPrDetailDistributions: GridParams | undefined;

  listPrDetailDistributions;
  selectedRowPrDetail;
  selectedRowPrDetailDistributions;
  sumPrice: number = 0;
  suppliers: SupplierOutputSelectDto[] = [];
  frameworkComponents;
  isLoading = false;
  selectedNode;
  inputRcvShipmentHeadersDto: InputRcvShipmentHeadersDto = new InputRcvShipmentHeadersDto()
  displayedData: GetRcvReceiptNoteLineForEditDto[] = [];
  listPoLineDetail: ExpectedReceiptsDto[] = [];
  selectedDatas: ExpectedReceiptsDto[] = [];
  countTab: number = 200;

  listDestinationType: { value: string, key: string | number }[] = [
    { value: 'Inventory', key: 'INVENTORY' },
    { value: 'Receiving', key: 'RECEIVING' },
  ];
  receiptStatusList = [
    {label: "", value : -1},
    //{label: "Đã tạo GR", value : 0},
    {label: "Đã nghiêm thu/Nhập kho", value : 0},
    {label: "Đã hủy", value : 2},
  ]
  approveStatusList = [
      {label: "", value : -1},
      {label: "Approved", value : "APPROVED"},
      {label: "Pending", value : "PENDING"},
      {label: "Rejected", value : "REJECTED"},
      {label: "Returned", value : "RETURNED"},
  ];

  uploadUrl: string = "";
  downloadUrl: string = "";
  removeUrl: string = '';
  formData: FormData = new FormData();
  @Input() uploadData: RcvShipmentAttachmentsDto[] = [];
  excelFileUpload: FileUpload;
  attColDef: CustomColDef[] = [];
  attachments: RcvShipmentAttachmentsDto[] = [];
  selectedRowAttachment: RcvShipmentAttachmentsDto = null;
  gridParamsAttachment: GridParams | undefined;
  fileName: string = "";
  receiptType: number = 0;
  employeeListAll: { value: number, title: string, label: string }[] = [];
  @Input('params') params: any;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private gridTableService: GridTableService,
    private _serviceProxy: RcvShipmentHeadersServiceProxy,
    private _httpClient: HttpClient,
    private mstSupplierServiceProxy: MstSupplierServiceProxy,
    private _commonService: CommonGeneralCacheServiceProxy,
    private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy,
    private _receiptNoteServiceProxy: RcvReceiptNoteHeadersServiceProxy,
    private dataFormatService: DataFormatService,
    private mstLocationsServiceProxy: MstLocationsServiceProxy,
    private _subInventories: MstInventoryItemSubInventoriesServiceProxy,
    private _approvalProxy : RequestApprovalTreeServiceProxy,
    private eventBus: EventBusService,
  ) {
    super(injector);
    this.frameworkComponents = {
      agDatepickerRendererComponent: AgDatepickerRendererComponent,
      agSelectRendererComponent: AgDropdownRendererComponent,
      agCheckboxRendererComponent: AgCheckboxRendererComponent,
    };

    this.gridColDefDetail = [
      // {
      //   headerName: this.l(''),
      //   headerTooltip: this.l(''),
      //   field: 'checked',
      //   cellRenderer: 'agCheckboxRendererComponent',
      //   data: [true, false],
      //   cellClass: ['cell-border', 'text-center'],
      //   width: 50,
      // },
      {
        headerName: this.l(''),
        headerTooltip: this.l(''),
        field: 'check',
        //cellRenderer: 'agCheckboxRendererComponent',
        data: [true, false],
        cellClass: ['cell-border', 'text-center'],
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        checkboxSelection: true,
        pinned: true,
        width: 50,
      },
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 50,
      },
      {
        headerName: this.l('PartNo'),
        headerTooltip: this.l('PartNo'),
        field: 'partNo',
        width: 100
      },
      {
        headerName: this.l('ItemDescription'),
        headerTooltip: this.l('ItemDescription'),
        field: 'itemDescription',
        width: 350,
      },
      {
        headerName: this.l('QuantityReceived'),
        headerTooltip: this.l('QuantityReceived'),
        field: 'quantityReceived',
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        width: 150,
        type: 'number'
      },
      {
        headerName: this.l('QuantityShippedModal'),
        headerTooltip: this.l('QuantityShippedModal'),
        field: 'quantityShipped',
        width: 150,
      },
      {
        headerName: this.l('QuantityOrdered'),
        headerTooltip: this.l('QuantityOrdered'),
        field: 'quantityOrdered',
        width: 150
      },
      {
        headerName: this.l('QuantityAvailable'),
        headerTooltip: this.l('QuantityAvailable'),
        field: 'quantityAvailable',
        width: 150,
        hide:true,
      },
      {
        headerName: this.l('NumberReceived'),
        headerTooltip: this.l('NumberReceived'),
        field: 'quantityAccumulated',
        width: 150
      },
      {
        headerName: this.l('QuantityRemained'),
        headerTooltip: this.l('QuantityRemained'),
        field: 'quantityRemained',
        width: 150
      },
      {
        headerName: this.l('Note'),
        headerTooltip: this.l('Note'),
        field: 'remark',
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        width: 200,
      },
      {
        headerName: this.l('UnitOfMeasure'),
        headerTooltip: this.l('UnitOfMeasure'),
        field: 'unitOfMeasure',
        width: 100
      },
      {
        headerName: this.l('PoNo'),
        headerTooltip: this.l('PoNo'),
        field: 'poNo',
        width: 100
      },

      // {
      //   headerName: this.l('ProductGroupName'),
      //   headerTooltip: this.l('ProductGroupName'),
      //   field: 'productGroupName',
      //   width: 350,
      // },
      // {
      //   headerName: this.l('Category'),
      //   headerTooltip: this.l('Category'),
      //   field: 'categoryDesc',
      //   width: 500,
      // },
      {
        headerName: this.l('DestinationType'),
        headerTooltip: this.l('DestinationType'),
        field: 'destinationTypeCode',
        cellRenderer: "agSelectRendererComponent",
        editable: true,
        cellClass: (params) => (params.data?.itemId > 0) ? ['cell-clickable', 'cell-border'] : ['cell-border'],
        list: (params: ValueGetterParams) => this.listDestinationType,
        width: 150,
      },

      {
        headerName: this.l('DeliverToLocationId'),
        headerTooltip: this.l('DeliverToLocationId'),
        field: 'deliverToLocationId',
        cellClass: ['cell-clickable', 'cell-border'],
        cellRenderer: "agSelectRendererComponent",
        list: (params: ValueGetterParams) => this.listLocationCombo,
        valueGetter: (params: any) => params?.data ? (this.listLocationCombo.map(o => Object.assign({}, { value: o.value, key: Number(o.key) })))?.find(e => e.key == params.data.deliverToLocationId)?.value : '',
        editable: true,
        //tooltipValueGetter: (params: ITooltipParams) => params?.data ? this.listLocationCombo.find(e => e.key === params.data.catId)?.value : '',
        width: 250,
      },
      {
        headerName: this.l('ToSubinventory'),
        headerTooltip: this.l('ToSubinventory'),
        field: 'toSubinventory',
        cellClass: ['cell-clickable', 'cell-border'],
        cellRenderer: "agSelectRendererComponent",
        list: (params: ValueGetterParams) => this.listSubInventories,
        editable: true,
        width: 200,
      },
      // {
      //   headerName: this.l('LocatorId'),
      //   headerTooltip: this.l('LocatorId'),
      //   field: 'locatorId',
      //   cellClass: ['cell-clickable', 'cell-border'],
      //   editable: true,
      //   width: 150,
      // },

      {
        headerName: this.l('CountryOfOriginCode'),
        headerTooltip: this.l('CountryOfOriginCode'),
        field: 'countryOfOriginCode',
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        width: 200,

      },
    ]

    this.supplierDefs = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        flex: 30,
      },
      {
        headerName: this.l('SupplierName'),
        headerTooltip: this.l('SupplierName'),
        field: 'supplierName',
        flex: 400,
      }
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

    this.gridPOsDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.listAllPOs.paginationParams.pageNum! - 1) * this.listAllPOs.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 40,
      },
      {
        headerName: this.l('PoNo'),
        headerTooltip: this.l('PoNo'),
        field: 'poNo',
        width: 100,
      },
      {
        headerName: this.l('ApprovedDate'),
        headerTooltip: this.l('ApprovedDate'),
        field: 'approvedDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.approvedDate) : "",
        width: 80,
      },
      {
        headerName: this.l('VendorName'),
        headerTooltip: this.l('VendorName'),
        field: 'vendorName',
        width: 300,
      },
      {
        headerName: this.l('Vendor'),
        headerTooltip: this.l('Vendor'),
        field: 'vendorId',
        width: 100,
        hide:true
      },
      {
        headerName: this.l('VendorSite'),
        headerTooltip: this.l('VendorSite'),
        field: 'vendorSiteId',
        width: 100,
        hide:true
      },
    ];


    this.attColDef = [
      {
          headerName: this.l('STT'),
          headerTooltip: this.l('STT'),
          cellRenderer: (params) => params.rowIndex + 1,
          cellClass: ['text-center'],
          flex: 1,
      },
      {
          headerName: "Tập tin",
          headerTooltip: "Tập tin",
          field: "serverFileName",
          flex: 3,
      }
    ];
    // this.uploadUrl = AppConsts.remoteServiceBaseUrl + '/CrmClaim/UploadAttach';
    this.uploadUrl = `${AppConsts.remoteServiceBaseUrl}/UploadGr/UploadGrFileToFolder`;
    this.downloadUrl = `${AppConsts.remoteServiceBaseUrl}/DownloadFile/GetGrAttachFileToDownload`;
    this.removeUrl = `${AppConsts.remoteServiceBaseUrl}/RemoveAttachFile/RemoveGrAttachFile`;
  }

  ngOnInit(): void {
    this.getSupplierList();

    this.buildForm();

    // this.listSupplier = this.params?.listSupplier;
    // this.siteListAll = this.params?.siteListAll;
    // this.employeeListAll = this.params?.employeeListAll;
    this.receiptType = this.params?.receiptType;
    //this.currentSupplierId = this.params?.currentSupplierId;
    //this.currentSiteId = this.params?.currentSiteId;

    // this.getAllSupplier();
    // this.mstOrganizationsServiceProxy.getAllOrganizations().subscribe((res) => {
    //   res.forEach(e => this.listOrganization.push({ label: e.name, value: e.id }))
    // });

    // this.mstLineTypeServiceProxy.getAllLineTypes().subscribe((res) => {
    //   res.forEach(e => this.listLineTypes.push({ label: e.lineTypeCode, value: e.id }))
    // });

    // this.mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
    //   res.forEach(e => this.listInventoryGroups.push({ label: e.productGroupCode, value: e.id }))
    // });
   // console.log(this.params.editId)
    // this.getGoodsReceiptEdit();
  }

  getGoodsReceiptEdit() {
    this.spinnerService.show();
    this._serviceProxy.getGoodsReceiptById(1).subscribe((result) => {
      this.createOrEditForm.patchValue(result);
      this.gridParamsPrDetail.api.setRowData(result.rcvShipmentLines);
      // this.gridParamsPrDetail.api.sizeColumnsToFit();
      this.spinnerService.hide();
    });
  }

  getSupplierList() {
    this.listSupplier = [{ value: -1, label: 'Tất cả' }];
    this.mstSupplierServiceProxy.getAllSupplierNotPaged("").subscribe(
      res => {
        res.forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
      });

    this._commonService.getAllSupplierSites().subscribe(
      res => {
        res.forEach(e => this.siteListAll.push({ supplierId: e.supplierId, id: e.id, vendorSiteCode: e.vendorSiteCode }));
      });

    this._paymentHeadersServiceProxy.getTMVUserList().subscribe(
      res => {
          this.employeeListAll = [{ value: -1, title:'', label: '' }];
          res.forEach(e =>
              this.employeeListAll.push({ value: e.id, title : e.titleDescription, label: e.name }));
      });

      this.mstLocationsServiceProxy.getAllLocations("").subscribe((res) => {
        this.listLocationCombo = [{ value: 'Tất cả', key: -1 }];
        res.forEach(e => this.listLocationCombo.push({ value: e.locationCode, key: e.id }))
      });

      this._subInventories.getAllSubInventories(-1, -1).subscribe(
        res => {
          this.listSubInventories = [{ value: '', key: ' ' }];
          res.map(it => { this.listSubInventories.push({ value: it.subInventory + '     ' + it.description, key: it.subInventory }); });
        });

      this._commonService.getDocumentByProcessType('GR').subscribe(
        res => {
            res.forEach(e =>
            this.listDocument.push({ value: e.id, label: e.documentCode + '-' + e.documentName }));
      });
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      receiptSourceCode: [undefined],
      vendorId: [undefined],
      vendorSiteId: [undefined],
      organizationId: [0],
      shipmentNum: [undefined],
      receiptNum: [undefined],
      billOfLading: [undefined],
      receivedDate: [new Date()],
      shippedDate: [new Date()],
      employeeId: [undefined, GlobalValidator.required],
      supplier: [undefined],
      waybillAirbillNum: [undefined],
      comments: [undefined],
      shipToOrgId: [0],
      newNote:  (this.params.editId)? [0] : [1],
      employeeId2: [undefined],
      deliverName1: [undefined],
      deliverTitle1: [undefined],
      deliverName2: [undefined],
      deliverTitle2: [undefined],
      employeeTitle1: [undefined],
      employeeTitle2: [undefined],
      receiptType: 0,
      status: 0,
      authorizationStatus: [undefined],
      serviceStartDate:[undefined],
      serviceEndDate:[undefined],
      fileName: [undefined],
      inventoryGroupId: [undefined],
      documentId: [undefined],
    });

    console.log('done1');
    this.searchForm = this.formBuilder.group({
        poNo: [undefined],
        poLineNum :  [undefined],
        poShipmentNum:  [undefined],
        prNo:  [undefined],
        prLineNum:  [undefined],
        vendorId:  [undefined],
        vendorSiteId:  [undefined],
        receivingLocationId:  [undefined],
        itemNo: [undefined],
    });
    console.log('done2');

    this.createOrEditForm.get("vendorId").valueChanges.subscribe(selectedValue => {
      this.createOrEditForm.get("vendorSiteId").setValue(-1);
      this.getSiteList(selectedValue);
    });
  }

  closeModel() {
    this.modal.hide();
  }

  reset() {
    this.createOrEditForm = undefined;
  }

  save() {
    const obj = Object.assign({}, this.createOrEditForm.getRawValue(), this.displayedData)
    console.log(obj);
    this.isSubmit = true;
    if (this.submitBtn) {
      this.submitBtn.nativeElement.click();
    }
    if (this.createOrEditForm.invalid) {
      return;
    }
  }

  showSearchPO() {
    if(this.createOrEditForm.get("vendorId").value <= 0){
      this.notify.warn(this.l("SelectSupplier"));
      return;
    }
    this.listAllPOs.show();
  }

  getAllPOs(suplierName: any, paginationParams: PaginationParamsModel) {
    return this._receiptNoteServiceProxy.getPOsForReceiptNote(
      this.searchForm.get("poNo").value,
      this.createOrEditForm.get("vendorId").value,
      -1, //this.createOrEditForm.get("vendorSiteId").value,
      this.receiptType,
      (this.listAllPOs.paginationParams ? this.listAllPOs.paginationParams.sorting : ''),
      (this.listAllPOs.paginationParams ? this.listAllPOs.paginationParams.pageSize : 100),
      (this.listAllPOs.paginationParams ? this.listAllPOs.paginationParams.skipCount : 1)
    );
  }

  getSiteList(supplierIdFilter) {
    this.siteList = [{ value: -1, label: 'Tất cả' }];
    this.siteListAll.filter(e => e.supplierId == supplierIdFilter)
      .forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));
  }

  patchPO(event: any[]) {
    if (event != undefined){
      console.log(event);
      let poNoList = "";
      event.map(e => {
        poNoList += e.poNo + ';'
      });

      //this.searchForm.get("poNo").setValue(event[0].poNo);
      this.searchForm.get("poNo").setValue(poNoList);
      this.createOrEditForm.get("vendorId").setValue(event[0].vendorId);
      this.listSupplier = [...this.listSupplier];
      this.getSiteList(event[0].vendorId);
      this.createOrEditForm.get("vendorSiteId").setValue(event[0].vendorSiteId);

      this.searchExpectedReceipts(false);
    }
  }

  searchExpectedReceipts(isCheckPO: boolean) {
    this.spinnerService.show();

    if (isCheckPO && !this.searchForm.get('poNo').value){
      this.notify.warn('PO No không được để trống!');
      this.spinnerService.hide();
      return;
    }

    this._serviceProxy.getAllExpectedReceipts_Store(
       this.searchForm.get('poNo').value,
       this.searchForm.get('poLineNum').value,
       this.searchForm.get('poShipmentNum').value,
       this.searchForm.get('prNo').value,
       this.searchForm.get('prLineNum').value,
       this.searchForm.get('vendorId').value,
       this.searchForm.get('vendorSiteId').value,
       this.searchForm.get('receivingLocationId').value,
       this.searchForm.get('itemNo').value,
       -1, //this.searchForm.get('poShipmentNum').value,
       -1,
       (this.paginationParams ? this.paginationParams.sorting : ''),
       (this.paginationParams ? this.paginationParams.pageSize : 20),
       (this.paginationParams ? this.paginationParams.skipCount : 1)
    )
    .pipe(finalize(() =>{
      this.spinnerService.hide();
      this.listDestinationType = [...this.listDestinationType];
    }))
    .subscribe((val) => {
      this.listPoLineDetail = val.items;

      this.gridParamsPrDetail.api.setRowData(this.listPoLineDetail);
      this.paginationParams.totalCount = val.totalCount;
      this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);
      // this.gridParamsPrDetail.api.sizeColumnsToFit();
      });
  }


  cellValueChanged(params: AgCellEditorParams) {
    const field = params.colDef.field;
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    switch (field) {
      case 'quantityReceived':
        //console.log(isNaN(Number(params.data[field])));
        if(isNaN(Number(params.data[field]))){
          this.notify.warn("Số lượng phải là số");
          params.data[field] = 0;
        }else
        if (params.data[field] <= 0) {
          this.notify.warn(this.l('QuanityGreatZero'));
          params.data[field] = 0;
        }else
        if(params.data[field] > params.data['quantityRemained'] ){
          this.notify.warn(this.l('Số lượng phải <= số lượng còn lại'));
          params.data[field] = 0;
        }
        break;
    }

    this.gridParamsPrDetail.api.refreshCells();
  }

  callBackGridPrDetail(params: GridParams) {
    this.gridParamsPrDetail = params;
    params.api.setRowData([]);
  }

  onChangeSelectionPrDetail(params) {
    this.selectedDatas = params.api.getSelectedRows() ?? [];
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowPrDetail = selectedRows[0];

      if(!this.createOrEditForm.get('vendorId').value){
        this.createOrEditForm.get('vendorId').setValue(this.selectedRowPrDetail?.vendorId);
       }

       if(!this.createOrEditForm.get('vendorSiteId').value){
        this.createOrEditForm.get('vendorSiteId').setValue(this.selectedRowPrDetail?.vendorSiteId);
      }
    }
  }

  calculateFooterDetail() {
    this.gridTableService.getAllData(this.gridParamsPrDetail).forEach((product) => {
      this.sumPrice += (Number(product.totalPrice) * product.quantity);
    })
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
    }
  }

  setLoading(params) {
    this.isLoading = params;
  }

  createGr() {
    console.log(this.displayedData);
    this.inputRcvShipmentHeadersDto = Object.assign(this.createOrEditForm.getRawValue(), {
      inputRcvShipmentLinesDto: this.displayedData
    });
    this._serviceProxy.createGoodsReceipt(this.inputRcvShipmentHeadersDto).subscribe((res) => {
        let input = new CreateRequestApprovalInputDto();
        input.reqId = res.id;
        input.processTypeCode = "GR";
        this._approvalProxy.createRequestApprovalTree(input).subscribe(res2 => {
            this.viewDetail(res.id, res);
        })
    });
  }

  onUpload(data: { target: { files: Array<any> } }): void {

    if (data?.target?.files.length > 0) {
        this.formData = new FormData();
        const formData: FormData = new FormData();
        const file = data?.target?.files[0];
        this.fileName = file?.name;
        console.log(file?.name);
        this.createOrEditForm.get('fileName').setValue(file?.name);
        let fileName = `${(this.fileName.split('.'))[0]}_${this.selectedNode?.receiptNoteNum ?? ''}_${(new Date()).getTime()}.${(this.fileName.split('.'))[1]}`;
        formData.append('file', file, fileName);
        this.formData = formData;
    }
  }

  downloadFile() {
    this._httpClient.get(this.downloadUrl, { params: { 'filename': this.selectedRowAttachment.serverFileName }, responseType: 'blob' })
    .subscribe(blob => {
        saveAs(blob, this.selectedRowAttachment.serverFileName);
    });
  }

  callBackGridAttachment(params: GridParams) {
    this.gridParamsAttachment = params;
    this.gridParamsAttachment.api.setRowData(this.uploadData);
  }

  upload() {
    //this.uploadData = [];
    //this.objEdit?.attachments?.map(e => this.uploadData.push(Object.assign(new RcvShipmentAttachmentsDto(), e)));
    this._httpClient
        .post<any>(this.uploadUrl, this.formData)
        .pipe(finalize(() => {this.excelFileUpload?.clear(); this.createOrEditForm.get('fileName').setValue('');}))
        .subscribe((response) => {
            this.fileName = "";
            if (response.success) {
                    this.uploadData.push(Object.assign(new RcvShipmentAttachmentsDto(),{
                      serverFileName: response.result.attachComplainMgmts?.attachName,
                      serverLink: response.result.attachComplainMgmts?.attachFile,
                      step: 0,
                    }));
                    console.log(this.uploadData);
                    //this.attachments = this.uploadData;
                    this.gridParamsAttachment?.api.setRowData(this.uploadData);
                    this.notify.success("Tải tệp lên thành công");

            } else if (response.error != null) {
                this.notify.error(this.l("invalid", this.l("Data")));
            }
            if (this.uploadData?.length < 1)
                return this.notify.error(this.l("invalid", this.l("Data")));
        });
  }

  deleteAttachFile() {
    var fileName = this.selectedRowAttachment.serverLink;
    console.log(this.selectedNode)
    const index = this.uploadData.findIndex((e: { serverLink: any; }) => e.serverLink === fileName);

    this.uploadData.splice(index, 1);
    this.gridParamsAttachment.api.setRowData(this.uploadData);
    this.selectedRowAttachment = undefined;

  }

  resetAttachment() {
    setTimeout(() => {
        this.InputVar.nativeElement.value = "";
        this.createOrEditForm.get('fileName').setValue('');
        this.InputVar.nativeElement.click();
    }, 500);
  }

  onChangeSelectionAttachment(params: GridParams) {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowAttachment = selectedRows[0];
    }
    //this.attachFileParams.api.forEachNode((node: RowNode) => { if (node.isSelected()) this.selectedNodeAttachment = node; });
  }

  createReceipt() {

    this.createOrEditForm.get('receiptType').setValue(this.receiptType);

    if (this.createOrEditForm.get('authorizationStatus').value == 'APPROVED') {
      this.notify.warn('Phiếu nhập kho đã được approved, không thể cập nhật!');
      return;
    }

    if (this.selectedDatas == null || this.selectedDatas.length == 0 || this.selectedDatas.filter(e => e.quantityReceived >0).length == 0) {
      this.notify.warn('Không có Lines nào được chọn!');
      return;
    }

    var isNegativeQty = false;
    var isOverAvailableQty = false;

    this.selectedDatas.forEach((obj) => {
      if(obj.quantityReceived < 0 ){
        isNegativeQty = true;
        return;
      }
      if(obj.quantityReceived > obj.quantityAvailable ){
        isOverAvailableQty = true;
        return;
      }
    });

    if (isNegativeQty){
      this.notify.warn('Số lượng nhận ko được < 0!');
      return;
    }

    if (isOverAvailableQty){
      this.notify.warn('Số lượng ko được vượt quá số lượng có thể nhận!');
      return;
    }

    this.inputRcvShipmentHeadersDto = Object.assign(this.createOrEditForm.getRawValue(), {
      inputRcvShipmentLinesDto: this.selectedDatas.filter(e => e.quantityReceived > 0),
      attachments: this.uploadData
    });

    console.log(this.inputRcvShipmentHeadersDto.id);

    const counter = {};
    const counterVendor = {};
    this.selectedDatas.filter(e => e.quantityReceived > 0 && e.isManuallyAdded == false).forEach((obj) => {
      counter[obj.inventoryGroupId] = (counter[obj.inventoryGroupId] || 0) + 1;
      counterVendor[obj.vendorId] = (counter[obj.vendorId] || 0) + 1;
    });

    if (Object.keys(counterVendor).length > 1) {
      this.notify.warn('Chọn các Lines cho cùng 1 nhà cung cấp!');
      return true;
    }

    if (Object.keys(counter).length > 1) {
      this.notify.warn('Chọn các Lines cho cùng 1 InventoryGroup!');
      return true;
    }

    if (this.inputRcvShipmentHeadersDto.id === 0) { //new

      console.log(this.inputRcvShipmentHeadersDto);
      // if (!this.inputRcvShipmentHeadersDto.receiptNum) {
      //   this.notify.warn('Yêu cầu chọn ReceiptNum!');
      //   return ;
      // }

      if (!this.inputRcvShipmentHeadersDto.receivedDate) {
        this.notify.warn('Yêu cầu chọn ReceivedDate!');
        return ;
      }

      if (!(this.inputRcvShipmentHeadersDto.vendorId > 0)) {
        this.notify.warn('Yêu cầu chọn Vendor!');
        return;
      }

      // if (!(this.inputRcvShipmentHeadersDto.vendorSiteId > 0)) {
      //   this.notify.warn('Yêu cầu chọn Vendor Site!');
      //   return;
      // }

      console.log(moment(this.inputRcvShipmentHeadersDto.receivedDate,'day'));

      if (!this.inputRcvShipmentHeadersDto.shippedDate != null
        && (moment(this.inputRcvShipmentHeadersDto.receivedDate,'day').isAfter(this.inputRcvShipmentHeadersDto.shippedDate,'day'))
        //&& this.inputRcvShipmentHeadersDto.shippedDate > this.inputRcvShipmentHeadersDto.receivedDate
      ) {
        this.notify.warn(this.l("Ngày giao < Ngày nhận", this.l('Ngày nhận')));
        return;
      }
    }
    else{
      var selectedLines = this.selectedDatas.filter(e => e.quantityReceived > 0 && e.isManuallyAdded == false);
      if (selectedLines.length > 0){
        var lineGroupId = selectedLines[0].inventoryGroupId;
        var lineGroupName = selectedLines[0].productGroupName;
        var headerGroupId = this.inputRcvShipmentHeadersDto.inventoryGroupId;
        if(lineGroupId != headerGroupId){
          this.notify.warn(this.l("Các Lines có group [" + lineGroupName + "] không cùng group với Receipt headers", this.l('InventoryGroup')));
          return;
        }
      }

    }
    this.spinnerService.show();
    this._serviceProxy.createGoodsReceipt(this.inputRcvShipmentHeadersDto)
    .pipe(finalize(()=> {
      this.spinnerService.hide();
    }))
    .subscribe((res) => {
      this.notify.success('Successfully');
      if(res != undefined){
        let input = new CreateRequestApprovalInputDto();
        input.reqId = res.id;
        input.processTypeCode = "GR";
        this._approvalProxy.createRequestApprovalTree(input).subscribe(res2 => {
            this.viewDetail(res.id, res);
        })

        res.vendorName = this.listSupplier?.find(e => e.value == res.vendorId)?.label;
        res.vendorSiteCode = this.siteListAll?.find(e => e.id == res.vendorSiteId)?.vendorSiteCode;
        res.employeeName1 = this.employeeListAll?.find(e => e.value == res.employeeId)?.label;
        res.employeeName2 = this.employeeListAll?.find(e => e.value == res.employeeId2)?.label;

      }
      this.searchExpectedReceipts(false);
    });
  }


  viewDetail(vEditId, res) {
    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.VIEW_GOODS_RECEIPT,
      tabHeader: (this.receiptType == 0 ? this.l('viewGoodsReceipt'): this.l('viewServiceReceipt')) + '-' + res?.receiptNum,
      params: {
        data: {
          countTab: this.countTab.toString(),
          editId: vEditId,
          selectedReceiptRow: res,
          receiptStatusList: this.receiptStatusList,
          approveStatusList: this.approveStatusList,
          receiptType: this.receiptType,
          //currentSupplierId: this.currentSupplierId
        }
      }
    });
    this.countTab += 1;
  };
}
