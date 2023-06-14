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
import { CommonGeneralCacheServiceProxy, ExpectedReceiptsDto, GetRcvShipmentLineForEditDto, InputRcvReceiptNoteHeadersDto, InputRcvReceiptNoteLinesDto, InputRcvShipmentHeadersDto, MstCategoriesServiceProxy, MstInventoryGroupServiceProxy, MstInventoryItemsServiceProxy, MstInventoryItemSubInventoriesServiceProxy, MstLineTypeServiceProxy, MstLocationsServiceProxy, MstOrganizationsServiceProxy, MstSupplierServiceProxy, MstUnitOfMeasureServiceProxy, PaymentHeadersServiceProxy, PurchaseRequestServiceProxy, RcvReceiptNoteHeadersServiceProxy, RcvShipmentAttachmentsDto, RcvShipmentHeadersServiceProxy, SupplierOutputSelectDto } from '@shared/service-proxies/service-proxies';
import { GlobalValidator } from '@shared/utils/validators';
import { Console } from 'console';
import * as saveAs from 'file-saver';
import { ceil } from 'lodash-es';
import { DateTime } from 'luxon';
import { isUndefined } from 'ngx-bootstrap/chronos/utils/type-checks';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-return-goods-receipt',
  templateUrl: './return-goods-receipt.component.html',
  styleUrls: ['./return-goods-receipt.component.less']
})
export class ReturnGoodsReceiptComponent extends AppComponentBase implements OnInit {
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('listAllReceiptNotes', { static: true }) listAllReceiptNotes!: TmssSelectGridModalComponent;
  @ViewChild('listAllReceipts', { static: true }) listAllReceipts!: TmssSelectGridModalComponent;
  @Output() close = new EventEmitter<any>();
 // searchForm: FormGroup;
  createOrEditForm: FormGroup;
  isEdit = true;
  isSubmit = false;

  gridColDefDetail: CustomColDef[];
  gridRNotesDef: CustomColDef[];
  gridReceiptsDef: CustomColDef[];

  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParamsPrDetail: GridParams | undefined;

  listPrDetailDistributions;
  selectedRowPrDetail;
  selectedRowPrDetailDistributions;
  sumPrice: number = 0;
  suppliers: SupplierOutputSelectDto[] = [];
  frameworkComponents;
  isLoading = false;
  selectedNode;
  inputRcvShipmentHeadersDto: InputRcvShipmentHeadersDto = new InputRcvShipmentHeadersDto()
  listPoLineDetail: GetRcvShipmentLineForEditDto[] = [];
  countTab: number = 10;

  poTypeLookupCode: string = "";
  poNo: string = "";
  vendorName: string = "";
  needByDate: DateTime;
  itemDescription: string = "";
  destination: string = "";
  receivingRoutingDesc: number = 0;

  listSupplier: { label: string, value: string | number }[] = [];
  siteListAll: { supplierId: number, id: number, vendorSiteCode: string }[] = [];
  siteList: { label: string, value: string | number }[] = [];
  listLocationCombo: { value: string | number, key: string | number }[] = [];
  listDocument: { label: string, value: string | number }[] = [];
  employeeListAll: { value: number, title: string, label: string }[] = [];

  listDestinationType: { value: string, key: string | number }[] = [
    { value: 'Inventory', key: 'Inventory' },
    { value: 'Receiving', key: 'Receiving' },
  ];

  listSubInventories: { value: string, key: string | number }[] = []
  vNewNote = true;
  userHandleList: { value: number, label: string }[] = []
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
  receiptType: number = 0; //default 
  uploadUrl: string = "";
  downloadUrl: string = "";
  removeUrl: string = '';
  selectedRowAttachment: RcvShipmentAttachmentsDto = null;
  attColDef: CustomColDef[] = [];
  @Input() uploadData: RcvShipmentAttachmentsDto[] = [];
  gridParamsAttachment: GridParams | undefined;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    //private _serviceReceiptNotes: RcvReceiptNoteHeadersServiceProxy,
    private _service: RcvShipmentHeadersServiceProxy,

    private mstSupplierServiceProxy: MstSupplierServiceProxy,
    private mstLocationsServiceProxy: MstLocationsServiceProxy,
    private _subInventories: MstInventoryItemSubInventoriesServiceProxy,
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
        width: 50,
      },
      {
        headerName: this.l('PartNo'),
        headerTooltip: this.l('PartNo'),
        field: 'partNo',
        width: 150,
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
        headerName: this.l('NumberReceived'),
        headerTooltip: this.l('NumberReceived'),
        field: 'quantityAccumulated',
        width: 150
      },
      {
        headerName: this.l('QuantityRemained'),
        headerTooltip: this.l('QuantityRemained'),
        field: 'quantityRemained',
        hide:true,
        width: 150
      },
      {
        headerName: this.l('QuantityShipped'),
        headerTooltip: this.l('QuantityShipped'),
        field: 'quantityShipped',
        width: 150,
      },
      {
        headerName: this.l('QuantityAccumulated'),
        headerTooltip: this.l('QuantityAccumulated'),
        field: 'quantityReturned',
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
        width: 150,
      },
      
      {
        headerName: this.l('DestinationType'),
        headerTooltip: this.l('DestinationType'),
        field: 'destinationTypeCode',
       
        width: 150,
      },
      {
        headerName: this.l('DeliverToLocationId'),
        headerTooltip: this.l('DeliverToLocationId'),
        field: 'deliverToLocationId',
        cellRenderer: "agSelectRendererComponent",
        list: (params: ValueGetterParams) => this.listLocationCombo,
        valueGetter: (params: any) => params?.data ? (this.listLocationCombo.map(o => Object.assign({}, { value: o.value, key: Number(o.key) })))?.find(e => e.key == params.data.deliverToLocationId)?.value : '',
        editable: false,
        //tooltipValueGetter: (params: ITooltipParams) => params?.data ? this.listLocationCombo.find(e => e.key === params.data.catId)?.value : '',
        width: 250,
      },
      {
        headerName: this.l('ToSubinventory'),
        headerTooltip: this.l('ToSubinventory'),
        field: 'toSubinventory',
        editable: true,
        width: 200,
      },
      {
        headerName: this.l('Category'),
        headerTooltip: this.l('Category'),
        field: 'categoryDesc',
        width: 500,
      },
      {
        headerName: this.l('CountryOfOriginCode'),
        headerTooltip: this.l('CountryOfOriginCode'),
        field: 'countryOfOriginCode',
        width: 200,
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
    
    this.uploadUrl = `${AppConsts.remoteServiceBaseUrl}/UploadGr/UploadGrFileToFolder`;
    this.downloadUrl = `${AppConsts.remoteServiceBaseUrl}/DownloadFile/GetGrAttachFileToDownload`;
    this.removeUrl = `${AppConsts.remoteServiceBaseUrl}/RemoveAttachFile/RemoveGrAttachFile`;
  }

  ngOnInit(): void {
    this.buildForm();
    this.mstLocationsServiceProxy.getAllLocations("").subscribe((res) => {
      this.listLocationCombo = [{ value: 'Tất cả', key: -1 }];
      res.forEach(e => this.listLocationCombo.push({ value: e.locationCode, key: e.id }))
    });
    this.getSupplierList();
    this._subInventories.getAllSubInventories(-1, -1).subscribe(
      res => {
        this.listSubInventories = [{ value: '', key: ' ' }];
        res.map(it => { this.listSubInventories.push({ value: it.subInventory + '     ' + it.description, key: it.subInventory }); });
      });

    console.log(this.params.editId); 

    //edit 
    if (this.params.editId){
      this.spinnerService.show();
      this._service.getGoodsReceiptById(this.params.editId)
      .pipe(finalize(() => this.spinnerService.hide()))
      .subscribe((val) => {
        if (val != null){
          this.listPoLineDetail= val.rcvShipmentLines;
          console.log(val.rcvShipmentLines) ;
          this.createOrEditForm.patchValue(val);
        }
        else
        {
          this.spinnerService.hide();
          this.notify.warn('Không có dữ liệu');
          return;
        }
 
        this.gridParamsPrDetail.api.setRowData(this.listPoLineDetail);
        this.paginationParams.totalCount = val.rcvShipmentLines.length;
        this.paginationParams.pageSize = val.rcvShipmentLines.length;
        this.paginationParams.totalPage = 1; 
        // this.gridParamsPrDetail.api.sizeColumnsToFit();
       });
     }
    }

  buildForm() {
    this.createOrEditForm = this.formBuilder.group({
      id: [0],
      receiptSourceCode: [undefined],
      vendorId: [0],
      vendorSiteId: [0],
      organizationId: [0],
      shipmentNum: [undefined],
      receiptNum: [undefined],
      billOfLading: [undefined],
      receivedDate: [new Date()],
      shippedDate: [new Date()],
      employeeId: [abp.session.userId, GlobalValidator.required],
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
      employeeName1: [undefined],
      employeeName2: [undefined],
      receiptType: 0,
      status: 0,
      authorizationStatus: [undefined],
      vendorName:[undefined],
      vendorSiteCode: [undefined],
      serviceStartDate:[undefined],
      serviceEndDate:[undefined],
      documentId: [undefined],
      documentName: [undefined],
    });
    
    this.createOrEditForm.get("vendorId").valueChanges.subscribe(selectedValue => {
      this.createOrEditForm.get("vendorSiteId").setValue(-1); 
      this.getSiteList(selectedValue);
    });
  }

  resetFom() {
    this.createOrEditForm.get("id").setValue(null);
    this.createOrEditForm.get("receiptNum").setValue('');
    this.createOrEditForm.get("vendorId").setValue(-1);
    this.createOrEditForm.get("vendorSiteId").setValue(-1);
    this.createOrEditForm.get("receivedDate").setValue(new Date());
    this.createOrEditForm.get("shippedDate").setValue(new Date());
    this.createOrEditForm.get("employeeId").setValue(-1);
  }

  setEnable(isEnable) {
    if (isEnable) {
      this.createOrEditForm.get("receiptNum").enable();
      this.createOrEditForm.get("vendorId").enable();
      this.createOrEditForm.get("vendorSiteId").enable();
      this.createOrEditForm.get("receivedDate").enable();
      this.createOrEditForm.get("shippedDate").enable();
      this.createOrEditForm.get("employeeId").enable();

    } else {
      this.createOrEditForm.get("receiptNum").disable();
      this.createOrEditForm.get("vendorId").disable();
      this.createOrEditForm.get("vendorSiteId").disable();
      this.createOrEditForm.get("receivedDate").disable();
      this.createOrEditForm.get("shippedDate").disable();
      this.createOrEditForm.get("employeeId").disable();
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

    this._commonService.getDocumentByProcessType('GR').subscribe(
      res => {
          res.forEach(e =>
          this.listDocument.push({ value: e.id, label: e.documentCode + '-' + e.documentName }));
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

  
  patchReceipt(event: any) {
    this.createOrEditForm.patchValue(event);

    if(event != undefined)
     this.fillReceiptDetail();
  }

  fillReceiptDetail(){
    this.spinnerService.show();
    
    this._service.getGoodsReceiptForReturnById(this.createOrEditForm.get("id").value)
    .pipe(finalize(() => this.spinnerService.hide()))
    .subscribe((val) => {

       if (val != null){
         this.listPoLineDetail= val.rcvShipmentLines;
         console.log( val);
         this.createOrEditForm.get('vendorId').setValue(val.vendorId);
         this.createOrEditForm.get('vendorSiteId').setValue(val.vendorSiteId);
       }
       else
       {
         this.spinnerService.hide();
         this.notify.warn('Không có dữ liệu');
         return;
       }

       this.gridParamsPrDetail.api.setRowData(this.listPoLineDetail);
       this.paginationParams.totalCount = val.rcvShipmentLines.length;
       this.paginationParams.pageSize = val.rcvShipmentLines.length;
       this.paginationParams.totalPage = 1; 
       // this.gridParamsPrDetail.api.sizeColumnsToFit();
      });
      
  
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
         
          if(params.data[field] < params.data['quantityRemained'] ){
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


  getAllReceipts(suplierName: any, paginationParams: PaginationParamsModel) {
    return this._service.getAllReceipts(
      this.createOrEditForm.get("receiptNum").value,
      this.createOrEditForm.get("vendorId").value,
      this.createOrEditForm.get("vendorSiteId").value,
      -1,
      "",
      this.receiptType,
      null, 
      null,
      (this.listAllReceipts.paginationParams ? this.listAllReceipts.paginationParams.sorting : ''),
      (this.listAllReceipts.paginationParams ? this.listAllReceipts.paginationParams.pageSize : 100),
      (this.listAllReceipts.paginationParams ? this.listAllReceipts.paginationParams.skipCount : 1)
    );
  }

  onChangeSelectionPrDetail(params) {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowPrDetail = selectedRows[0];

      this.poTypeLookupCode = this.selectedRowPrDetail.poTypeLookupCode;
      this.poNo = this.selectedRowPrDetail.poNo;
      this.vendorName = this.selectedRowPrDetail.vendorName;
      this.needByDate = this.selectedRowPrDetail.needByDate;
      this.itemDescription = this.selectedRowPrDetail.itemDescription;
      this.destination = this.selectedRowPrDetail.destination;
      this.receivingRoutingDesc = this.selectedRowPrDetail.receivingRoutingDesc;
    }
    // this.selectedRow = Object.assign({}, this.selectedRow);
  }


  cellEditingStopped(params: AgCellEditorParams) {
    const field = params.colDef.field;
    const rowIndex = this.gridParamsPrDetail.api.getDisplayedRowCount() - 1;
    switch (field) {
      case 'quantityReceived':
          if (params.data[field] > 0) {
            params.data[field] = 0; 
          }

          if(params.data[field] < params.data['quantityRemained'] ){ // quantityReceived is negative 
            params.data[field] = 0; 
          }
        break;
    }

    this.gridParamsPrDetail.api.refreshCells();
  }

  setLoading(params) {
    this.isLoading = params;
  }

  closeForm(){}
  
  returnReceipt() {
    if (!this.listPoLineDetail.some(e => e.checked == true)) {
      this.notify.warn('Không có Lines nào được chọn!');
      return true;
    }

    var isPositiveQty = false; 
    var isOverAvailableQty = false; 

    this.listPoLineDetail.filter(e => e.checked == true).forEach((obj) => {
      if(obj.quantityReceived > 0 ){
        isPositiveQty = true; 
        return; 
      }
      if(obj.quantityReceived < obj.quantityRemained){ //quantityReceived is negative
        isOverAvailableQty = true; 
        return; 
      }
    }); 

    if (isPositiveQty){ 
      this.notify.warn('Số lượng nhận ko được > 0!');
      return;
    }

    if (isOverAvailableQty){ 
      this.notify.warn('Số lượng nhận ko được vượt quá số lượng có thể return!');
      return;
    }

    this.inputRcvShipmentHeadersDto = Object.assign(this.createOrEditForm.getRawValue(), {
      inputRcvShipmentLinesDto: this.listPoLineDetail.filter(e => e.checked == true)
    });

    this.spinnerService.show();
    this._service.returnGoodsReceipt(this.inputRcvShipmentHeadersDto)
    .pipe(finalize(() => 
      {
        this.spinnerService.hide(); 
        this.fillReceiptDetail();
      }))
    .subscribe((res) => {
      if(res != undefined){
        res.vendorName = this.listSupplier?.find(e => e.value == res.vendorId)?.label;
        res.vendorSiteCode = this.siteListAll?.find(e => e.id == res.vendorSiteId)?.vendorSiteCode;
        res.employeeName1 = this.employeeListAll?.find(e => e.value == res.employeeId)?.label;
        res.employeeName2 = this.employeeListAll?.find(e => e.value == res.employeeId2)?.label;
        res.documentName = this.listDocument?.find(e => e.value == res.documentId)?.label;
        this.viewDetail(res.id, res); 
      }
     // this.fillReceiptDetail();
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
          currentSupplierId: -1, // this.currentSupplierId
        }
      }
    });
    this.countTab += 1;
  }; 

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

  onChangeSelectionAttachment(params: GridParams) {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowAttachment = selectedRows[0];
    }
    //this.attachFileParams.api.forEachNode((node: RowNode) => { if (node.isSelected()) this.selectedNodeAttachment = node; });
  }
}
