import { ICellEditorParams, ICellRendererParams, RowNode, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
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
import { CommonGeneralCacheServiceProxy, CreateRequestApprovalInputDto, GetRcvReceiptNoteLineForEditDto, InputRcvShipmentHeadersDto,  MstInventoryItemSubInventoriesServiceProxy, MstLocationsServiceProxy,MstSupplierServiceProxy, PaymentHeadersServiceProxy, RcvReceiptNoteHeadersServiceProxy, RcvShipmentAttachmentsDto, RcvShipmentHeadersServiceProxy, RequestApprovalTreeServiceProxy, SupplierOutputSelectDto } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { UtilsService } from 'abp-ng2-module';
import { Console } from 'console';
import * as saveAs from 'file-saver';
import { ceil } from 'lodash-es';
import { DateTime } from 'luxon';
import * as moment from 'moment';
import { isUndefined } from 'ngx-bootstrap/chronos/utils/type-checks';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FileUpload } from 'primeng/fileupload';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'create-or-edit-gr-from-receipt-note',
  templateUrl: './create-or-edit-gr-from-receipt-note.component.html',
  styleUrls: ['./create-or-edit-gr-from-receipt-note.component.less']
})
export class CreateOrEditGrFromReceiptNoteComponent extends AppComponentBase implements OnInit {
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('listAllReceiptNotes', { static: true }) listAllReceiptNotes!: TmssSelectGridModalComponent;
  @ViewChild('listAllReceipts', { static: true }) listAllReceipts!: TmssSelectGridModalComponent;
  @ViewChild('imgInput', { static: false }) InputVar: ElementRef;
  @ViewChild('inputReceiptNoteNum', { static: false }) inputReceiptNoteNum: ElementRef;

  @Output() close = new EventEmitter<any>();
  searchForm: FormGroup;
  createOrEditForm: FormGroup;
  isEdit = false;
  isSubmit = false;
  countTab: number = 10;

  gridColDefDetail: CustomColDef[];
  gridRNotesDef: CustomColDef[];
  gridReceiptsDef: CustomColDef[];

  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParamsPrDetail: GridParams | undefined;

  selectedRowLineDetail;
  selectedDatas: GetRcvReceiptNoteLineForEditDto[] = [];
  sumPrice: number = 0;
  suppliers: SupplierOutputSelectDto[] = [];
  frameworkComponents;
  isLoading = false;
  selectedNode;
  inputRcvShipmentHeadersDto: InputRcvShipmentHeadersDto = new InputRcvShipmentHeadersDto()
  listPoLineDetail: GetRcvReceiptNoteLineForEditDto[] = [];

  poTypeLookupCode: string = "";
  poNo: string = "";
  vendorName: string = "";
  needByDate: DateTime;
  itemDescription: string = "";
  destination: string = "";
  receivingRoutingDesc: number = 0;

  listSupplier: { label: string, value: string | number }[] = [];
  siteListAll: { supplierId: number, id: number, vendorSiteCode: string }[] = [];
  siteList: { label: string, value: string | number }[] = [{ value: -1, label: 'Tất cả' }];
  listLocationCombo: { value: string | number, key: string | number }[] = [];
  listDocument: { label: string, value: string | number }[] = [];
  fileName: string = "";

  listDestinationType: { value: string, key: string | number }[] = [
    { value: 'Inventory', key: 'INVENTORY' },
    { value: 'Receiving', key: 'RECEIVING' },
  ];

  listSubInventories: { value: string, key: string | number }[] = []
  vNewNote = true;
  userHandleList: { value: number, label: string }[] = []
  employeeListAll: { value: number, title: string, label: string }[] = [];
  gridParamsAttachment: GridParams | undefined;
  idListStr : string;

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
    ]

  @Input('params') params: any;
  receiptType: number;
  currentSupplierId: number = undefined;
  currentSiteId: number = undefined;
  uploadUrl: string = "";
  downloadUrl: string = "";
  removeUrl: string = '';
  headerName: string = '';
  formData: FormData = new FormData();
  @Input() uploadData: RcvShipmentAttachmentsDto[] = [];
  excelFileUpload: FileUpload;
  attColDef: CustomColDef[] = [];
  attachments: RcvShipmentAttachmentsDto[] = [];
  selectedRowAttachment: RcvShipmentAttachmentsDto = null;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private _serviceReceiptNotes: RcvReceiptNoteHeadersServiceProxy,
    private _service: RcvShipmentHeadersServiceProxy,
    private _approvalProxy: RequestApprovalTreeServiceProxy,
    private mstSupplierServiceProxy: MstSupplierServiceProxy,
    private mstLocationsServiceProxy: MstLocationsServiceProxy,
    private _subInventories: MstInventoryItemSubInventoriesServiceProxy,
    private activeRoute: ActivatedRoute,
    private eventBus: EventBusService,
    private _commonService: CommonGeneralCacheServiceProxy,
    private _httpClient: HttpClient,
    private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy,

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
        width: 150
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

    this.gridRNotesDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.listAllReceiptNotes.paginationParams.pageNum! - 1) * this.listAllReceiptNotes.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        flex: 0.5,
      },
      {
        headerName: this.l('ReceiptNoteNum'),
        headerTooltip: this.l('ReceiptNoteNum'),
        field: 'receiptNoteNum',
        flex: 1,
      },
      {
        headerName: this.l('ReceiptDate'),
        headerTooltip: this.l('ReceiptDate'),
        field: 'receivedDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate) : "",
        flex: 1,
      },
      {
        headerName: this.l('VendorName'),
        headerTooltip: this.l('VendorName'),
        field: 'vendorName',
        flex: 3,
      },
      {
        headerName: this.l('VendorSiteCode'),
        headerTooltip: this.l('VendorSiteCode'),
        field: 'vendorSiteCode',
        flex: 1,
      },
    ];
    this.gridReceiptsDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.listAllReceipts.paginationParams.pageNum! - 1) * this.listAllReceipts.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 50,
      },
      {
        headerName: this.l('ReceiptNum'),
        headerTooltip: this.l('ReceiptNum'),
        field: 'receiptNum',
        width: 150,
      },
      {
        headerName: this.l('ReceiptDate'),
        headerTooltip: this.l('ReceiptDate'),
        field: 'receivedDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate) : "",
        width: 100,
      },
      {
        headerName: this.l('VendorName'),
        headerTooltip: this.l('VendorName'),
        field: 'vendorName',
        width: 300,
      },
      {
        headerName: this.l('VendorSiteCode'),
        headerTooltip: this.l('VendorSiteCode'),
        field: 'vendorSiteCode',
        width: 100,
      },
    ];

    this.mstLocationsServiceProxy.getAllLocations("").subscribe((res) => {
      this.listLocationCombo = [{ value: 'Tất cả', key: -1 }];
      res.forEach(e => this.listLocationCombo.push({ value: e.locationCode, key: e.id }))
    });

    // this._serviceReceiptNotes.getUserList(null).subscribe(
    //   res => {
    //     this.userHandleList = [{ value: -1, label: ' ' }];
    //     res.map(it => { this.userHandleList.push({ value: it.id, label: it.name }); });
    //   });

    this._subInventories.getAllSubInventories(-1, -1).subscribe(
      res => {
        this.listSubInventories = [{ value: '', key: ' ' }];
        res.map(it => { this.listSubInventories.push({ value: it.subInventory + '     ' + it.description, key: it.subInventory }); });
      });

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

  ngAfterViewInit() {
    setTimeout(() => {

        //this.inputReceiptNoteNum.nativeElement.focus();

    }, 200);
  }

  ngOnInit(): void {
    this.buildForm();

    this.listSupplier = this.params?.listSupplier;
    this.siteListAll = this.params?.siteListAll;
    this.employeeListAll = this.params?.employeeListAll;
    this.receiptType = this.params?.receiptType;
    this.currentSupplierId = this.params?.currentSupplierId;
    this.currentSiteId = this.params?.currentSiteId;

    //console.log(this.listSupplier)
    //if(this.listSupplier == undefined || this.listSupplier.length == 0){
      this.getSupplierList();
    //}

    //edit
    if (this.params?.editId){
      this.spinnerService.show()
      console.log(this.params?.selectedReceiptRow);
      this.isEdit = true;
      this.createOrEditForm.patchValue(this.params?.selectedReceiptRow);

      this.setEnable(false);
      this.createOrEditForm.get('vendorSiteId').setValue(this.params?.selectedReceiptRow.vendorSiteId);

      this._service.getAllAttachmentsByHeaderID(this.params?.editId)
      .pipe(finalize(() => this.spinnerService.hide()))
      .subscribe((res) => {
          this.uploadData = res;
          this.gridParamsAttachment.api.setRowData(this.uploadData);
      });
    }else{
      if(this.currentSupplierId > 0){
        this.createOrEditForm.get("vendorId").setValue(this.currentSupplierId);
        this.searchForm.get("vendorId").setValue(this.currentSupplierId);
      }

      if(this.currentSiteId > 0){
        this.createOrEditForm.get("vendorSiteId").setValue(this.currentSiteId);
        this.searchForm.get("vendorSiteId").setValue(this.currentSiteId);
      }
    }
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

    this.searchForm = this.formBuilder.group({
      receiptNoteNum: [undefined],
      vendorId: [undefined],
      vendorSiteId: [undefined],
      id: [undefined],
      idListStr: [undefined]
    });

    if(!this.isEdit){

    }

    this.searchForm.get("vendorId").valueChanges.subscribe(selectedValue => {
      this.searchForm.get("vendorSiteId").setValue(-1);
      this.getSiteList(selectedValue);
    });

    this.createOrEditForm.get("vendorId").valueChanges.subscribe(selectedValue => {
      this.createOrEditForm.get("vendorSiteId").setValue(-1);
      this.searchForm.get("vendorId").setValue(selectedValue);
      this.getSiteList(selectedValue);
    });

    this.createOrEditForm.get("vendorSiteId").valueChanges.subscribe(selectedValue => {
      this.searchForm.get("vendorSiteId").setValue(selectedValue);
    });

    this.createOrEditForm.get("employeeId").valueChanges.subscribe(selectedValue => {
        this.employeeListAll.filter(e => e.value == selectedValue)?.forEach((obj)=>{
            this.createOrEditForm.get("employeeTitle1").setValue(obj.title);
        });
    });

    this.createOrEditForm.get("employeeId2").valueChanges.subscribe(selectedValue => {
      this.employeeListAll.filter(e => e.value == selectedValue)?.forEach((obj)=>{
          this.createOrEditForm.get("employeeTitle2").setValue(obj.title);
      });
    });

    this.createOrEditForm.get("newNote").valueChanges.subscribe(selectedValue => {

      this.vNewNote = selectedValue;
      if (selectedValue == 0) {
         this.listAllReceipts.show();
      } else {
        //this.createOrEditForm.reset();
        this.resetFom();
      }
      this.setEnable(selectedValue);
    });
  }

  resetFom() {
    this.createOrEditForm.get("id").setValue(null);
    this.createOrEditForm.get("receiptNum").setValue('');
    this.createOrEditForm.get("vendorId").setValue(undefined);
    this.createOrEditForm.get("vendorSiteId").setValue(undefined);
    this.createOrEditForm.get("receivedDate").setValue(new Date());
    this.createOrEditForm.get("shippedDate").setValue(new Date());
    this.createOrEditForm.get("employeeId").setValue(-1);
  }

  setEnable(isEnable) {
    if (isEnable) {
     // this.createOrEditForm.get("receiptNum").enable();
      this.createOrEditForm.get("vendorId").enable();
      this.createOrEditForm.get("vendorSiteId").enable();
      //this.createOrEditForm.get("receivedDate").enable();
      //this.createOrEditForm.get("shippedDate").enable();
      //this.createOrEditForm.get("employeeId").enable();

    } else {
      //this.createOrEditForm.get("receiptNum").disable();
      this.createOrEditForm.get("vendorId").disable();
      this.createOrEditForm.get("vendorSiteId").disable();
      //this.createOrEditForm.get("receivedDate").disable();
      //this.createOrEditForm.get("shippedDate").disable();
      //this.createOrEditForm.get("employeeId").disable();
    }
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

      this._commonService.getDocumentByProcessType('GR').subscribe(
        res => {
            res.forEach(e =>
            this.listDocument.push({ value: e.id, label: e.documentCode + '-' + e.documentName }));
     });
  }

  getSiteList(supplierIdFilter) {
    //console.log(this.siteListAll)
    this.siteList = [{ value: -1, label: 'Tất cả' }];
    this.siteListAll.filter(e => e.supplierId == supplierIdFilter)
      .forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));

    // this.mstSupplierServiceProxy.getAllSupplierSiteBySupplierIdNotPaged(supplierIdFilter, "").subscribe(
    //   res => {
    //     res.forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));
    //   });
  }

  closeModel() {
    this.modal.hide();
  }

  reset() {
    this.createOrEditForm = undefined;
  }

  patchReceiptNote(event: any[]) {
    console.log("patchReceiptNote");
    console.log(event);
    if (event != undefined){
      //this.searchForm.patchValue(event[0]);
      this.idListStr = ";";
      let receiptNoteNumList = "";

      event.map(e => {
        receiptNoteNumList += e.receiptNoteNum + ';'
        this.idListStr += e.id + ';'
      });
      console.log(receiptNoteNumList);
      console.log(this.idListStr)
      this.searchForm.get('vendorId').setValue(event[0].vendorId);
      this.searchForm.get('receiptNoteNum').setValue(receiptNoteNumList);
      this.searchForm.get('idListStr').setValue(this.idListStr);

      if(this.isEdit){

      }
      else {
        //this.createOrEditForm.get("vendorId").setValue(this.searchForm.get("vendorId").value);
        //this.createOrEditForm.get("vendorSiteId").setValue(this.searchForm.get("vendorSiteId").value);
        this.createOrEditForm.patchValue(event[0]);
        this.createOrEditForm.get('id').setValue(0);
      }
      this.listSupplier = [...this.listSupplier];
      this.employeeListAll = [...this.employeeListAll];
      this.fillReceiptNoteDetail();
    }else {
      this.listPoLineDetail = [];
      this.gridParamsPrDetail.api.setRowData(this.listPoLineDetail);
    }
  }

  patchReceipt(event: any) {
    console.log("patchReceipt");
    if (event != undefined){
      this.createOrEditForm.patchValue(event);
      this.searchForm.get("vendorId").setValue(this.createOrEditForm.get("vendorId").value);
      this.searchForm.get("vendorSiteId").setValue(this.createOrEditForm.get("vendorSiteId").value);
    }
  }

  fillReceiptNoteDetail(){
    console.log('calling fillReceiptNoteDetail');
    this.spinnerService.show();

    this._serviceReceiptNotes.getReceiptNoteLinesForReceipt(
      //this.searchForm.get('idListStr').value
      this.idListStr
    ).pipe(finalize(()=> {
        this.spinnerService.hide();
      })).subscribe((val) => {
          this.listPoLineDetail= val.items;
          //this.createOrEditForm.get('vendorId').setValue(val.vendorId);
          //this.createOrEditForm.get('vendorSiteId').setValue(val.vendorSiteId);

          this.gridParamsPrDetail.api.setRowData(this.listPoLineDetail);
          this.paginationParams.totalCount = val.totalCount;
          this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);
          // this.gridParamsPrDetail.api.sizeColumnsToFit();
      });

  }

  search() {
   // if(!this.searchForm.get('receiptNoteNum').value){
      //this.notify.warn("receiptNoteNum không đc để trống");
      this.listAllReceiptNotes.show();
    //}
  }

  cellValueChanged(params: AgCellEditorParams) {
    const field = params.colDef.field;
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    switch (field) {
      case 'quantityReceived':
          if(isNaN(Number(params.data[field]))){
            this.notify.warn("Số lượng phải là số");
            params.data[field] = 0;
            return;
          }
          if (params.data[field] <= 0) {
            this.notify.warn(this.l('QuanityGreatZero'));
            params.data[field] = 0;
            return;
          }
          if(params.data[field] > params.data['quantityRemained'] ){
            this.notify.warn(this.l('Số lượng phải <= số lượng còn lại'));
            params.data[field] = 0;
          }
        break;
    }

    this.gridParamsPrDetail.api.refreshCells();
  }

  callBackGridLineDetail(params: GridParams) {
    this.gridParamsPrDetail = params;
    params.api.setRowData([]);
  }

  getAllReceiptNotes(suplierName: any, paginationParams: PaginationParamsModel) {
    return this._serviceReceiptNotes.getAllReceiptNotes(
      this.searchForm.get("receiptNoteNum").value,
      this.searchForm.get("vendorId").value,
      -1, //this.searchForm.get("vendorSiteId").value,
      4, // 0 & 1
      this.receiptType,
      null,
      null,
      (this.listAllReceiptNotes.paginationParams ? this.listAllReceiptNotes.paginationParams.sorting : ''),
      (this.listAllReceiptNotes.paginationParams ? this.listAllReceiptNotes.paginationParams.pageSize : 100),
      (this.listAllReceiptNotes.paginationParams ? this.listAllReceiptNotes.paginationParams.skipCount : 1)
    );
  }

  getAllReceipts(suplierName: any, paginationParams: PaginationParamsModel) {
    return this._service.getAllReceipts(
      "",
      this.createOrEditForm.get("vendorId").value,
      this.createOrEditForm.get("vendorSiteId").value,
      4,
      "",
      this.receiptType,
      null,
      null,
      (this.listAllReceipts.paginationParams ? this.listAllReceipts.paginationParams.sorting : ''),
      (this.listAllReceipts.paginationParams ? this.listAllReceipts.paginationParams.pageSize : 100),
      (this.listAllReceipts.paginationParams ? this.listAllReceipts.paginationParams.skipCount : 1)
    );
  }


  onChangeSelectionLinesDetail(params) {

    this.selectedDatas = params.api.getSelectedRows() ?? [];
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowLineDetail = selectedRows[0];

      // this.poTypeLookupCode = this.selectedRowPrDetail.poTypeLookupCode;
      // this.poNo = this.selectedRowPrDetail.poNo;
      // this.vendorName = this.selectedRowPrDetail.vendorName;
      // this.needByDate = this.selectedRowPrDetail.needByDate;
      // this.itemDescription = this.selectedRowPrDetail.itemDescription;
      // this.destination = this.selectedRowPrDetail.destination;
      // this.receivingRoutingDesc = this.selectedRowPrDetail.receivingRoutingDesc;
    }
    // this.selectedRow = Object.assign({}, this.selectedRow);
  }

  onChangeSelectionAttachment(params: GridParams) {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowAttachment = selectedRows[0];
    }
    //this.attachFileParams.api.forEachNode((node: RowNode) => { if (node.isSelected()) this.selectedNodeAttachment = node; });
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

  createReceipt() {

    this.createOrEditForm.get('receiptType').setValue(this.receiptType);

    if (this.createOrEditForm.get('authorizationStatus').value == 'APPROVED') {
      this.notify.warn('Phiếu nhập kho đã được approved, không thể cập nhật!');
      return;
    }

    //if (!this.listPoLineDetail.some(e => e.checked == true && e.quantityReceived > 0)) {
    if (!this.selectedDatas.some(e => e.quantityReceived > 0)) {
      this.notify.warn('Không có Lines nào được chọn!');
      return;
    }

    var isNegativeQty = false;
    var isOverAvailableQty = false;

   // this.listPoLineDetail.filter(e => e.checked == true).forEach((obj) => {
    this.selectedDatas.filter(e => e.quantityReceived > 0).forEach((obj) => {
      if(obj.quantityReceived <= 0 ){
        isNegativeQty = true;
        return;
      }
      if(obj.quantityReceived > obj.quantityAvailable ){
        isOverAvailableQty = true;
        return;
      }
    });

    if (isNegativeQty){
      this.notify.warn('Số lượng nhận ko được <= 0!');
      return;
    }

    if (isOverAvailableQty){
      this.notify.warn('Số lượng ko được vượt quá số lượng có thể nhận!');
      return;
    }

    this.inputRcvShipmentHeadersDto = Object.assign(this.createOrEditForm.getRawValue(), {
     // inputRcvShipmentLinesDto: this.listPoLineDetail.filter(e => e.checked == true && e.quantityReceived > 0),
     inputRcvShipmentLinesDto: this.selectedDatas.filter(e => e.quantityReceived > 0),
      attachments: this.uploadData
    });

    console.log(this.inputRcvShipmentHeadersDto.id);

    const counter = {};
    //this.listPoLineDetail.filter(e => e.checked == true && e.quantityReceived > 0 && e.isManuallyAdded == false).forEach((obj) => {
    this.selectedDatas.filter(e => e.quantityReceived > 0 && e.isManuallyAdded == false).forEach((obj) => {
      counter[obj.inventoryGroupId] = (counter[obj.inventoryGroupId] || 0) + 1
    });


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
      //var selectedLines = this.listPoLineDetail.filter(e => e.checked == true && e.quantityReceived > 0 && e.isManuallyAdded == false);
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
    this._service.createGoodsReceipt(this.inputRcvShipmentHeadersDto)
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
        res.documentName = this.listDocument?.find(e => e.value == res.documentId)?.label;
        // this.viewDetail(res.id, res);
      }
      this.fillReceiptNoteDetail();
    });
  }


  saveReceiptHeader(){
    if (this.createOrEditForm.get('authorizationStatus').value == 'APPROVED') {
      this.notify.warn('Phiếu nhập kho đã được approved, không thể cập nhật!');
      return;
    }

    this.inputRcvShipmentHeadersDto = Object.assign(this.createOrEditForm.getRawValue(), {
      inputRcvShipmentLinesDto: this.listPoLineDetail.filter(e => e.checked == true),
      attachments: this.uploadData
    });

    this.spinnerService.show();
    this._service.updateReceiptHeader(this.inputRcvShipmentHeadersDto)
    .pipe(finalize(()=> {
      this.spinnerService.hide();
    })).subscribe(() => {
        this.notify.success('Successfully');
        if (this.searchForm.get('id').value > 0) this.fillReceiptNoteDetail();
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
          currentSupplierId: this.currentSupplierId
        }
      }
    });
    this.countTab += 1;
  };

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

  searchByReceiptNoteNum(receiptNoteNum){
    if(!receiptNoteNum){
      return;
    }
    this.spinnerService.show();
    this._serviceReceiptNotes.getReceiptNoteByNumForReceipt(
      receiptNoteNum
    ).pipe(finalize(() => this.spinnerService.hide()))
    .subscribe((res) => {
      if (res != undefined){
        this.searchForm.get('vendorId').setValue(res.vendorId);
        this.searchForm.get('vendorSiteId').setValue(res.vendorSiteId);
        this.createOrEditForm.patchValue(res);
        this.createOrEditForm.get('id').setValue(0);
        this.listPoLineDetail= res.inputRcvReceiptNoteLinesDto;

        this.gridParamsPrDetail.api.setRowData(this.listPoLineDetail);
        this.paginationParams.totalCount = res.inputRcvReceiptNoteLinesDto.length;
        this.paginationParams.totalPage = ceil(res.inputRcvReceiptNoteLinesDto.length/ this.paginationParams.pageSize);
      }
      else{
        this.notify.warn("Dữ liệu không hợp lệ");
        this.createOrEditForm.patchValue(res);
        this.createOrEditForm.get('id').setValue(0);
        this.listPoLineDetail= [];

        this.gridParamsPrDetail.api.setRowData(this.listPoLineDetail);
        this.paginationParams.totalCount = 0;
        this.paginationParams.totalPage = ceil(0/ this.paginationParams.pageSize);
      }
    });
  }

}
