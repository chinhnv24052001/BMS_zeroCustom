import { ICellEditorParams, ICellRendererParams, RowNode, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, UntypedFormBuilder } from '@angular/forms';
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
import { CommonGeneralCacheServiceProxy, ExpectedReceiptsDto, GetExpectedReceiptNoteLinesDto, InputRcvReceiptNoteHeadersDto, InputRcvShipmentHeadersDto, MstCategoriesServiceProxy, MstInventoryGroupServiceProxy, MstInventoryItemsServiceProxy, MstInventoryItemSubInventoriesServiceProxy, MstLineTypeServiceProxy, MstLocationsServiceProxy, MstOrganizationsServiceProxy, MstSupplierServiceProxy, MstUnitOfMeasureServiceProxy, PaymentHeadersServiceProxy, ProfileServiceProxy, PurchaseRequestServiceProxy, RcvReceiptNoteHeadersServiceProxy, RcvShipmentHeadersServiceProxy, SupplierOutputSelectDto, UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { AbpSessionService } from 'abp-ng2-module/lib/services/session/abp-session.service';
import { Console } from 'console';
import * as saveAs from 'file-saver';
import { ceil } from 'lodash-es';
import { DateTime } from 'luxon';
import * as moment from 'moment';
import { isUndefined } from 'ngx-bootstrap/chronos/utils/type-checks';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'create-or-edit-receipt-note',
  templateUrl: './create-or-edit-receipt-note.component.html',
  styleUrls: ['./create-or-edit-receipt-note.component.less']
})
export class CreateOrEditReceiptNoteComponent extends AppComponentBase implements OnInit {

  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('listAllReceiptNotes', { static: true }) listAllReceiptNotes!: TmssSelectGridModalComponent;
  @ViewChild('listAllPOs', { static: true }) listAllPOs!: TmssSelectGridModalComponent;
  @ViewChild('listUOM', { static: true }) listUOM!: TmssSelectGridModalComponent;
  @Output() close = new EventEmitter<any>();

  searchForm: FormGroup;
  createOrEditForm: FormGroup;
  isEdit = false;
  isSubmit = false;

  gridColDefDetail: CustomColDef[];
  supplierDefs: CustomColDef[];
  gridRNotesDef: CustomColDef[];
  gridPOsDef: CustomColDef[];
  gridColDefManually: CustomColDef[];
  uomItemsDefs: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParamsReceiptNoteDetail: GridParams | undefined;
  gridParamsLineManually: GridParams | undefined;

  listPrDetailDistributions;
  selectedRowPrDetail;
  selectedRowLineManual;
  sumPrice: number = 0;
  suppliers: SupplierOutputSelectDto[] = [];
  frameworkComponents;
  isLoading = false;
  selectedNode;
  inputRcvShipmentHeadersDto: InputRcvReceiptNoteHeadersDto = new InputRcvReceiptNoteHeadersDto()
  listPoLineDetail: GetExpectedReceiptNoteLinesDto[] = [];
  selectedDatas: GetExpectedReceiptNoteLinesDto[] = [];

  //Start manually add items 
  listLineManual: GetExpectedReceiptNoteLinesDto[] = [];
  selectedDatasManuallly: GetExpectedReceiptNoteLinesDto[] = [];
  //End

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
  employeeListAll: { value: number, title: string, label: string }[] = [];
  currentSupplierId : number;
  currentSiteId: number; 

  // listDestinationType: { value: string, key: string | number }[] = [
  //   { value: 'Inventory', key: 'Inventory' },
  //   { value: 'Receiving', key: 'Receiving' },
  // ];

  listSubInventories: { value: string, key: string | number }[] = []

  vNewNote = true;
  userHandleList: { value: number, label: string }[] = []
  receipteNoteId: number = 0;

  receiptNoteStatusList = [
    {label: "", value : -1},
    {label: "Đã tạo GRN", value : 0},
    {label: "Đã nghiêm thu/Nhập kho", value : 1},
    {label: "Đã hủy", value : 2},
  ]
  countTab: number = 10;

  @Input('params') params: any;
  receiptNoteType: number;
  urlBase: string = AppConsts.remoteServiceBaseUrl;
  
  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private _serviceProxy: RcvReceiptNoteHeadersServiceProxy,
    private http: HttpClient,
    private mstSupplierServiceProxy: MstSupplierServiceProxy,
    private _profileService: ProfileServiceProxy,
    private _commonService: CommonGeneralCacheServiceProxy,
    private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy,
    private eventBus: EventBusService,
    private mstUnitOfMeasureServiceProxy: MstUnitOfMeasureServiceProxy
  ) {
    super(injector);
    this.frameworkComponents = {
      agDatepickerRendererComponent: AgDatepickerRendererComponent,
      agSelectRendererComponent: AgDropdownRendererComponent,
      agCheckboxRendererComponent: AgCheckboxRendererComponent,
    };

    this.gridColDefDetail = [
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
        width: 200,
      },
     {
       headerName: this.l('ItemDescription'),
       headerTooltip: this.l('ItemDescription'),
       field: 'itemDescription',
       width: 350,
     },
      {
        headerName: this.l('QuantityShipped'),
        headerTooltip: this.l('QuantityShipped'),
        field: 'quantityShipped',
        width: 150,
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
      },
      {
        headerName: this.l('QuantityOrdered'),
        headerTooltip: this.l('QuantityOrdered'),
        field: 'quantityOrdered',
        width: 150
      },
      {
        headerName: this.l('QuantityAccumulated'),
        headerTooltip: this.l('QuantityAccumulated'),
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
        headerName: this.l('QuantityReceived'),
        headerTooltip: this.l('QuantityReceived'),
        field: 'quantityReceived',
        width: 150
      },

      {
        headerName: this.l('PoNo'),
        headerTooltip: this.l('PoNo'),
        field: 'poNo',
        width: 200,
      },
       
      {
        headerName: this.l('UnitOfMeasure'),
        headerTooltip: this.l('UnitOfMeasure'),
        field: 'unitOfMeasure',
        width: 100
      },
      {
        headerName: this.l('ExpiryDate'),
        headerTooltip: this.l('ExpiryDate'),
        field: 'expiryDate',
        width: 200,
        valueGetter: params => this.dataFormatService.dateFormat(params.data.expiryDate),
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        cellRenderer: 'agDatepickerRendererComponent',
        //hide: (this.receiptNoteType==1)
      },
      {
        headerName: this.l('FinishedDate'),
        headerTooltip: this.l('FinishedDate'),
        field: 'finishedDate',
        width: 200,
        valueGetter: params => this.dataFormatService.dateFormat(params.data.finishedDate),
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        cellRenderer: 'agDatepickerRendererComponent',
        //hide: (this.receiptNoteType==1)
      },
      
      
    ]

    this.gridColDefManually = [
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
        headerName: this.l('QuantityShipped'),
        headerTooltip: this.l('QuantityShipped'),
        field: 'quantityShipped',
        width: 150,
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
      },
      {
        headerName: this.l('QuantityOrdered'),
        headerTooltip: this.l('QuantityOrdered'),
        field: 'quantityOrdered',
        width: 150
      },
      {
        headerName: this.l('QuantityReceived'),
        headerTooltip: this.l('QuantityReceived'),
        field: 'quantityReceived',
        width: 150
      },

      
      {
        headerName: this.l('PartNo'),
        headerTooltip: this.l('PartNo'),
        field: 'partNo',
        width: 200,
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
      },
      {
        headerName: this.l('ItemDescription'),
        headerTooltip: this.l('ItemDescription'),
        field: 'itemDescription',
        width: 350,
        editable: true,
        cellClass: ['cell-clickable', 'cell-border'],
      },

      {
        headerName: this.l('QuantityRemained'),
        headerTooltip: this.l('QuantityRemained'),
        field: 'quantityRemained',
        width: 150
      },
      {
        headerName: this.l('UnitOfMeasure'),
        headerTooltip: this.l('UnitOfMeasure'),
        field: 'unitOfMeasure',
        width: 100,
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
      },
      {
        headerName: this.l('ExpiryDate'),
        headerTooltip: this.l('ExpiryDate'),
        field: 'expiryDate',
        width: 200,
        valueGetter: params => this.dataFormatService.dateFormat(params.data.expiryDate),
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        cellRenderer: 'agDatepickerRendererComponent',
        //hide: (this.receiptNoteType==1)
      },
      {
        headerName: this.l('FinishedDate'),
        headerTooltip: this.l('FinishedDate'),
        field: 'finishedDate',
        width: 200,
        valueGetter: params => this.dataFormatService.dateFormat(params.data.finishedDate),
        cellClass: ['cell-clickable', 'cell-border'],
        editable: true,
        cellRenderer: 'agDatepickerRendererComponent',
        //hide: (this.receiptNoteType==1)
      },
      
    ]

    this.gridRNotesDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.listAllReceiptNotes.paginationParams.pageNum! - 1) * this.listAllReceiptNotes.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        width: 50,
      },
      {
        headerName: this.l('ReceiptNoteNum'),
        headerTooltip: this.l('ReceiptNoteNum'),
        field: 'receiptNoteNum',
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

    this.gridPOsDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
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
  }

  ngOnInit(): void {
    this.buildForm();
    
    this.receiptNoteType = this.params?.receiptNoteType;
    this.listSupplier = this.params?.listSupplier; 
    this.employeeListAll = this.params?.employeeListAll; 
    this.siteListAll = this.params?.siteListAll; 
    this.currentSupplierId = this.params?.currentSupplierId; 
    this.currentSiteId = this.params?.currentSiteId;

    //if(this.listSupplier.length == 0  || this.currentSupplierId == undefined){
    this.getSupplierList();
    //}

    if(this.currentSupplierId != -1){
      this.createOrEditForm.get("vendorId").setValue(this.currentSupplierId); 
    }

    if(this.currentSiteId != -1){
      this.createOrEditForm.get("vendorSiteId").setValue(this.currentSiteId); 
    }
    
    //edit 
    if (this.params?.editId){
      this.isEdit = true;
      this.siteList = [{ value: -1, label: 'Tất cả' }];
      this.siteListAll.filter(e => e.supplierId == this.params.selectedReceiptNote.vendorId)
        .forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));
    
      //this.spinnerService.show();
      this.createOrEditForm.patchValue(this.params.selectedReceiptNote); 
      this.setEnable(false);
    }
  }

  searchReceiptNote() {
    this.listAllReceiptNotes.show();
    // if(!this.createOrEditForm.get('receiptNoteNum').value){
    //   this.listAllReceiptNotes.show();
    // }
  }

  patchReceiptNote(event: any) {
    this.createOrEditForm.patchValue(event);
  }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      receiptSourceCode: [undefined],
      vendorId: [-1],
      vendorSiteId: [-1],
      organizationId: [0],
      shipmentNum: [undefined],
      receiptNoteNum: [undefined],
      billOfLading: [undefined],
      receivedDate: [new Date()],
      shippedDate: [new Date()],
      employeeId: [undefined],
      supplier: [undefined],
      waybillAirbillNum: [undefined],
      comments: [undefined],
      shipToOrgId: [0],
      newNote: this.params?.editId? [0] : [1],
      employeeId2: [undefined],
      deliverName1: [undefined],
      deliverTitle1: [undefined],
      deliverName2: [undefined],
      deliverTitle2: [undefined],
      employeeTitle1: [undefined],
      employeeTitle2: [undefined],
      receiptNoteType: this.receiptNoteType,
      status: 0,
      serviceStartDate:[undefined],
      serviceEndDate:[undefined],
      vendorName: [undefined],
      vendorSiteCode: [undefined],
      creatorUser: [this.appSession.user.name],
      inventoryGroupId: [undefined],
      isInventory: [undefined],
    });

    this.searchForm = this.formBuilder.group({
      poNo: [undefined],
      poLineNum: [undefined],
      poShipmentNum: [undefined],
      prNo: [undefined],
      prLineNum: [undefined],
      vendorId: [undefined],
      vendorSiteId: [undefined],
      receivingLocationId: [undefined],
      itemNo: [undefined],
    });

    this.createOrEditForm.get("vendorId").valueChanges.subscribe(selectedValue => {
       this.getSiteList(selectedValue);
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
    
  }

  resetFom() {
    this.createOrEditForm.reset();

    // this.createOrEditForm.get("id").setValue(null);
    // this.createOrEditForm.get("receiptNoteNum").setValue('');
    // this.createOrEditForm.get("vendorId").setValue(-1);
    // this.createOrEditForm.get("vendorSiteId").setValue(-1);
    // this.createOrEditForm.get("receivedDate").setValue(new Date());
    // this.createOrEditForm.get("shippedDate").setValue(new Date());
    // this.createOrEditForm.get("employeeId").setValue(-1);
    // this.createOrEditForm.get("employeeId2").setValue(-1);
  }

  setEnable(isEnable) {
    if (isEnable) {
     // this.createOrEditForm.get("receiptNoteNum").enable();
      this.createOrEditForm.get("vendorId").enable();
      this.createOrEditForm.get("vendorSiteId").enable();
      this.createOrEditForm.get("status").enable();
      //this.createOrEditForm.get("receivedDate").enable();
      //this.createOrEditForm.get("shippedDate").enable();

     //this.createOrEditForm.get("employeeId").enable();

    } else {
      //this.createOrEditForm.get("receiptNoteNum").disable();
      this.createOrEditForm.get("vendorId").disable();
      this.createOrEditForm.get("vendorSiteId").disable();
      this.createOrEditForm.get("status").disable();
      //this.createOrEditForm.get("receivedDate").disable();
      //this.createOrEditForm.get("shippedDate").disable();
      //this.createOrEditForm.get("employeeId").disable();
    }
  }

  showSearchPO() {
    this.listAllPOs.show();
  }

  getAllPOs(suplierName: any, paginationParams: PaginationParamsModel) {
    return this._serviceProxy.getPOsForReceiptNote(
      this.searchForm.get("poNo").value,
      this.createOrEditForm.get("vendorId").value,
      -1, //this.createOrEditForm.get("vendorSiteId").value,
      this.receiptNoteType,
      (this.listAllPOs.paginationParams ? this.listAllPOs.paginationParams.sorting : ''),
      (this.listAllPOs.paginationParams ? this.listAllPOs.paginationParams.pageSize : 100),
      //1,
      (this.listAllPOs.paginationParams ? this.listAllPOs.paginationParams.skipCount : 1)
    );
  }
  patchSupplier(event: any) {

  }
  patchPO(event: any) {
    if (event.poNo){
      this.searchForm.get("poNo").setValue(event.poNo);
      this.getSiteList(event.vendorId);
      this.createOrEditForm.get("vendorId").setValue(event.vendorId);
      this.createOrEditForm.get("vendorSiteId").setValue(event.vendorSiteId);
      this.siteList = [...this.siteList];
      this.search(false); 
    }
  }

   //#region api get list
  getAllSupplier(suplierName: any, paginationParams: PaginationParamsModel) {
    return this.mstSupplierServiceProxy.getAllSupplierNotPaged(
      suplierName ?? ''
    );
  }

  getSupplierList() {
    //this._appSessionService.user.supplierContactId
    
    this._profileService.getCurrentUserSupplierId()
    .subscribe((res)=>{
      this.currentSupplierId = res;
      this.mstSupplierServiceProxy.getAllSupplierNotPaged("")
      .pipe(finalize(() => {
        if (this.currentSupplierId != -1) {
          this.createOrEditForm.get("vendorId").setValue(this.currentSupplierId);
        }
      }))
      .subscribe(
        res => {
          this.listSupplier = this.currentSupplierId != -1 ? []: [{ value: -1, label: 'Tất cả' }];; 
          res.filter(e => this.currentSupplierId == -1 || e.id == this.currentSupplierId)
            .forEach(e => this.listSupplier.push({ value: e.id, label: e.supplierName }));
            //sites
      });

      this._commonService.getAllSupplierSites()
          .pipe(finalize(() =>{
            this.getSiteList(this.currentSupplierId) ;
          })).subscribe(
            res => {
              this.siteListAll = [];
              res.forEach(e => this.siteListAll.push({ supplierId: e.supplierId, id: e.id, vendorSiteCode: e.vendorSiteCode }));
            });
    });
       
   
    this._paymentHeadersServiceProxy.getTMVUserList().subscribe(
       res => {
           this.employeeListAll = [{ value: -1, title:'', label: '' }];
           res.forEach(e => 
               this.employeeListAll.push({ value: e.id, title : e.titleDescription, label: e.name }));
       });
  }
getSiteList(supplierIdFilter) {
  this.siteList = [{ value: -1, label: 'Tất cả' }];
  this.siteListAll.filter(e => e.supplierId == supplierIdFilter)
    .forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));

  // if(this.siteList != undefined && this.siteList.length == 2){
  //   this.createOrEditForm.get("vendorSiteId").setValue(this.siteList[1].value);
  // }
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

  search(isCheckPO: boolean) {
    this.spinnerService.show();

    if (isCheckPO && !this.searchForm.get('poNo').value){
      this.notify.warn('PO No không được để trống!');
      this.spinnerService.hide();
      return;
    }

    this._serviceProxy.getAllExpectedReceiptNoteLines(
      this.searchForm.get('poNo').value,
      this.searchForm.get('poLineNum').value,
      this.searchForm.get('poShipmentNum').value,
      this.createOrEditForm.get('vendorId').value,
      this.createOrEditForm.get('vendorSiteId').value,
      this.searchForm.get('itemNo').value,
      -1, //tenantId
      this.receiptNoteType, //receiptNoteType
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(()=> {
          this.spinnerService.hide();
      }))
      .subscribe((val) => {
        this.listPoLineDetail = val.items;
        if (val != undefined){
          this.gridParamsReceiptNoteDetail.api.setRowData(this.listPoLineDetail);
          this.paginationParams.totalCount = val.totalCount;
          this.paginationParams.pageSize = val.totalCount;
          this.paginationParams.totalPage = 1; //ceil(val.totalCount / this.paginationParams.pageSize);
          this.gridParamsReceiptNoteDetail.api.sizeColumnsToFit();
        }
      });
  }

  cellValueChanged(params: AgCellEditorParams) {
    const field = params.colDef.field;
    const rowIndex = this.gridParamsReceiptNoteDetail.api.getDisplayedRowCount() - 1;
    switch (field) {
      case 'quantityShipped':
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
            this.notify.warn(this.l('Số lượng phải <= số lượng giao'));
            params.data[field] = 0; 
            return;
          }
        break;
    }

    this.gridParamsReceiptNoteDetail.api.refreshCells();
  }

  cellValueChangedLineManual(params: AgCellEditorParams) {
    const field = params.colDef.field;
    const rowIndex = this.gridParamsLineManually.api.getDisplayedRowCount() - 1;
    switch (field) {
      case 'quantityShipped':
          if (params.data[field] <= 0) {
            params.data[field] = 0; 
          }
          // if(params.data[field] > params.data['quantityRemained'] ){
          //   params.data[field] = 0; 
          // }
        break;
    }

    this.gridParamsLineManually.api.refreshCells();
  }

  callBackGridPrDetail(params: GridParams) {
    this.gridParamsReceiptNoteDetail = params;
    this.gridParamsReceiptNoteDetail.columnApi.setColumnVisible('expiryDate', this.receiptNoteType == 0); 
    this.gridParamsReceiptNoteDetail.columnApi.setColumnVisible('finishedDate', this.receiptNoteType == 1); 
    params.api.setRowData([]);
  }

  callBackGridLineManually(params: GridParams) {
    this.gridParamsLineManually = params;
    this.gridParamsLineManually.columnApi.setColumnVisible('expiryDate', this.receiptNoteType == 0); 
    this.gridParamsLineManually.columnApi.setColumnVisible('finishedDate', this.receiptNoteType == 1); 
    params.api.setRowData([]);
  }

  getAllReceiptNotes(suplierName: any, paginationParams: PaginationParamsModel) {
    return this._serviceProxy.getAllReceiptNotes(
      "",
      this.currentSupplierId?? -1, //this.createOrEditForm.get("vendorId").value,
      -1, //this.createOrEditForm.get("vendorSiteId").value,
      0,
      this.receiptNoteType,
      null,
      null,
      (this.listAllReceiptNotes.paginationParams ? this.listAllReceiptNotes.paginationParams.sorting : ''),
      (this.listAllReceiptNotes.paginationParams ? this.listAllReceiptNotes.paginationParams.pageSize : 100),
      (this.listAllReceiptNotes.paginationParams ? this.listAllReceiptNotes.paginationParams.skipCount : 1)
    );
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
    // this.selectedRow = Object.assign({}, this.selectedRow);
  }

  onChangeSelectionLineManaylly(params) {
    this.selectedDatasManuallly = params.api.getSelectedRows() ?? [];
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowLineManual = selectedRows[0];
    }
  }

  cellEditingStopped(params: AgCellEditorParams) {
    const col = params.colDef.field;
    const rowIndex = this.gridParamsReceiptNoteDetail.api.getDisplayedRowCount() - 1;
    switch (col) {
      case 'lineTypeId':
        if (params.data[col] === 1) {
          this.gridParamsReceiptNoteDetail.api.startEditingCell({ colKey: 'partNo', rowIndex });
        }
        break;
    }
  }

  setLoading(params) {
    this.isLoading = params;
  }

  createReceiptNote() {
    this.createOrEditForm.get('receiptNoteType').setValue(this.receiptNoteType);

    if (this.createOrEditForm.get('status').value > 0) {
      this.notify.warn('Phiếu nhận hàng không ở trạng thái có thể chỉnh sửa!');
      return;
    }

    //this..some(e => e.checked == true)
    if ((this.selectedDatas == null || this.selectedDatas.length == 0) 
      && (this.selectedDatasManuallly == null || this.selectedDatasManuallly.length == 0)) {
      this.notify.warn('Không có Lines nào được chọn!');
      return true;
    }

    const counter = {};
    this.selectedDatas.filter(e => e.quantityShipped > 0).forEach((obj) => {
      counter[obj.vendorId] = (counter[obj.vendorId] || 0) + 1
    }); 

    if (Object.keys(counter).length > 1) {
      this.notify.warn('Chọn các Lines cho cùng 1 Vendor!');
      return true;
    }
    
    this.inputRcvShipmentHeadersDto = Object.assign(this.createOrEditForm.getRawValue(), {
      inputRcvReceiptNoteLinesDto: 
        this.selectedDatas.filter(e => e.quantityShipped > 0)
          .concat(this.selectedDatasManuallly.filter(e => e.quantityShipped > 0)) //this.listPoLineDetail.filter(e => e.checked == true)
    });

    if (this.inputRcvShipmentHeadersDto.id === 0) { //new 
      
      // if (!this.inputRcvShipmentHeadersDto.receiptNoteNum) {
      //   this.notify.warn('Yêu cầu chọn ReceiptNoteNum!');
      //   return ;
      // }

      if (this.receiptNoteType == 0 && !this.inputRcvShipmentHeadersDto.receivedDate) {
        this.notify.warn('Yêu cầu chọn ReceivedDate!');
        return ;
      }
      
      if (this.receiptNoteType == 1 && !this.inputRcvShipmentHeadersDto.serviceStartDate) {
        this.notify.warn('Yêu cầu chọn ngày bắt đầu!');
        return ;
      }

      if (!(this.inputRcvShipmentHeadersDto.vendorId > 0)) {
        this.notify.warn('Yêu cầu chọn Vendor!');
        return;
      }
      var isNotSameS = false; 
      //this.listPoLineDetail.filter(e => e.checked == true).forEach((obj) => {
      this.selectedDatas.filter(e => e.quantityShipped > 0).forEach((obj) => {
        if(obj.vendorId != this.inputRcvShipmentHeadersDto.vendorId){
          isNotSameS = true; 
        }
      }); 

      if (isNotSameS){ 
        this.notify.warn('Lines không thuộc nhà cung cấp được chọn!');
        return;
      }

      const counter = {};
      this.selectedDatas.filter(e => e.quantityReceived > 0 && e.isManuallyAdded == false).forEach((obj) => {
        counter[obj.inventoryGroupId] = (counter[obj.inventoryGroupId] || 0) + 1
      }); 

      if (Object.keys(counter).length > 1) {
        this.notify.warn('Chọn các Lines cho cùng 1 InventoryGroup!');
        return true;
      }

     // console.log(this.inputRcvShipmentHeadersDto.vendorId vendorId);

      // if (!(this.inputRcvShipmentHeadersDto.vendorSiteId > 0)) {
      //   this.notify.warn('Yêu cầu chọn Vendor Site!');
      //   return;
      // }

      if (!this.inputRcvShipmentHeadersDto.shippedDate != null
        && (moment(this.inputRcvShipmentHeadersDto.receivedDate,'day').isAfter(this.inputRcvShipmentHeadersDto.shippedDate,'day'))
       // && this.inputRcvShipmentHeadersDto.shippedDate > this.inputRcvShipmentHeadersDto.receivedDate
      ) {
        this.notify.warn(this.l("Ngày giao < Ngày nhận", this.l('Ngày nhận')));
        return;
      }

      if (!this.inputRcvShipmentHeadersDto.serviceEndDate != null
        && (moment(this.inputRcvShipmentHeadersDto.serviceStartDate,'day').isAfter(this.inputRcvShipmentHeadersDto.serviceEndDate,'day'))
       // && this.inputRcvShipmentHeadersDto.shippedDate > this.inputRcvShipmentHeadersDto.receivedDate
      ) {
        this.notify.warn(this.l("Ngày bắt đầu < Ngày kết thúc", this.l('Ngày kết thúc')));
        return;
      }
    }
    else{
      var selectedLines = this.selectedDatas.filter(e => e.quantityShipped > 0);
      if (selectedLines.length > 0){
        var lineGroupId = selectedLines[0].inventoryGroupId;
        var lineGroupName = selectedLines[0].productGroupName;
        var headerGroupId = this.inputRcvShipmentHeadersDto.inventoryGroupId; 
        if(lineGroupId != headerGroupId){
          this.notify.warn(this.l("Các Lines có group [" + lineGroupName + "] không cùng group với Receipt Note", this.l('InventoryGroup')));
          return;
        }
      }
    }

    this.spinnerService.show();
    this._serviceProxy.createReceiptNotes(this.inputRcvShipmentHeadersDto)
    .pipe(finalize(()=> {
      this.spinnerService.hide();
   
    })).subscribe((res) => {
        this.receipteNoteId = res.id;
        this.notify.success('Tạo Receipt Note: ' + res.receiptNoteNum + ' thành công');
        this.search(false);
        this.selectedDatasManuallly = [];
        this.gridParamsLineManually.api.setRowData(this.selectedDatasManuallly);
        if(res != undefined){
          res.vendorName = this.listSupplier?.find(e => e.value == res.vendorId)?.label;
          res.vendorSiteCode = this.siteListAll?.find(e => e.id == res.vendorSiteId)?.vendorSiteCode;
          res.employeeName1 = this.employeeListAll?.find(e => e.value == res.employeeId)?.label;
          res.employeeName2 = this.employeeListAll?.find(e => e.value == res.employeeId2)?.label;
          this.viewDetail(res.id, res.receiptNoteNum, res); 
        }
      });
  }

  viewDetail(vEditId, receiptNoteNum, res) {
    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.VIEW_RECEIPT_NOTE,
      tabHeader: (this.receiptNoteType == 0 ?  this.l('viewReceiptNote'): this.l('viewAcceptanceNote')) + '-' + receiptNoteNum,
      params: {
        data: {
          countTab: this.countTab.toString(),
          editId: vEditId,
          selectedReceiptNote: res,
          receiptNoteType: this.receiptNoteType
        }
      }
    });
    this.countTab += 1;
  }; 

  printReceiptNote(formType: number){
    this.spinnerService.show();
    this._serviceProxy.getReceiptNoteReportById(this.receipteNoteId, formType)
    .subscribe( (res) => {
      this.http.post(
          `${this.urlBase}/api/GRReport/ExportReceiptNoteReport`,
              res,
          {
              responseType: "blob",
          }
        ).pipe(finalize(() => this.spinnerService.hide()))
        .subscribe((blob) => saveAs(blob, "ReceiptNote.pdf"));
  });
  }

  cancelReceiptNote(){
    let id = this.createOrEditForm.get("id").value
    if (this.createOrEditForm.get("status").value > 0){
      this.notify.warn("Không thể hủy");
      return; 
    }

    if (id && id> 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._serviceProxy.cancelReceiptNote(id)
          .pipe(finalize(()=> {
            this.spinnerService.hide();
          }))
          .subscribe(val => {
            this.notify.success('Successfully Canceled');
            //this.search();
            this.createOrEditForm.get("status").setValue(2); 
            this.receiptNoteStatusList = [...this.receiptNoteStatusList]
          });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

  saveReceiptNoteHeader(){
    if (this.createOrEditForm.get('status').value > 0) {
      this.notify.warn('Phiếu nhận hàng không ở trạng thái có thể chỉnh sửa!');
      return;
    }

    this.inputRcvShipmentHeadersDto = Object.assign(this.createOrEditForm.getRawValue());

    this.spinnerService.show();
    this._serviceProxy.updateReceiptNoteHeader(this.inputRcvShipmentHeadersDto)
    .pipe(finalize(()=> {
      this.spinnerService.hide();
      this.search(false);
    })).subscribe(() => {
        this.notify.success('Successfully');
      });
  }

  addRow() {
    const blankRow = {
      stt: this.listLineManual.length + 1,
      id: 0,
      checked: true,
      quantityShipped: 0,
      quantityRemained: 0,
      quantityReceived: 0,
      quantityOrdered: 0,
      unitOfMeasure: '',
      itemDescription: '',
      itemId: 0,
      categoryId: 0,
      poHeaderId: undefined,
      poLineId: undefined,
      poTypeLookupCode: undefined,
      poNo: undefined,
      partNo: undefined,
      isManuallyAdded: true
    }

    this.gridParamsLineManually.api.applyTransaction({ add: [blankRow] });
    const rowIndex = this.gridParamsLineManually.api.getDisplayedRowCount() - 1;
    setTimeout(() => {
      this.gridParamsLineManually.api.startEditingCell({ colKey: 'quantityShipped', rowIndex });
      this.selectedNode = this.gridParamsLineManually.api.getRowNode(`${rowIndex}`);
      this.gridParamsLineManually.api.getRowNode(`${rowIndex}`).setSelected(true);
    }, 100);
  }

  removeSelectedRow() {
    if (!this.selectedDatasManuallly) {
        this.notify.warn(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete);
        return;
    }
    this.gridParamsLineManually.api.applyTransaction({ remove: [this.selectedRowLineManual] })
    this.selectedRowLineManual = undefined;  
  }

  getAllUOM(unitOfMeasure: any, paginationParams: PaginationParamsModel) {
    return this.mstUnitOfMeasureServiceProxy.getAllUmoNotPaged(unitOfMeasure, '', '');
  }

  patchUOM(event: any) {
    this.selectedNode.data.unitOfMeasure = event.unitOfMeasure;
    this.gridParamsLineManually?.api.applyTransaction({ update: [this.selectedNode.data] });
  }

  searchByEnter(params: ICellEditorParams) {
    const col = params?.colDef?.field;
    switch (col) {
      case 'unitOfMeasure':
        this.listUOM.show(
          params.data?.uom ?? '',
          undefined,
          undefined,
          'uom'
        );
    }
  }
}
