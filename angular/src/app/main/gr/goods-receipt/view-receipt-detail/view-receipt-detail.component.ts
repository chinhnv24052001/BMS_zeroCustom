import { ICellEditorParams, ICellRendererParams, RowNode, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AgCheckboxRendererComponent } from '@app/shared/common/grid-input-types/ag-checkbox-renderer/ag-checkbox-renderer.component';
import { AgDatepickerRendererComponent } from '@app/shared/common/grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { AgDropdownRendererComponent } from '@app/shared/common/grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';
import { AgCellEditorParams, CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { AgDataValidateService } from '@app/shared/services/ag-data-validate.service';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { GridTableService } from '@app/shared/services/grid-table.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, CreateRequestApprovalInputDto, GetRcvShipmentLineForEditDto, InputRcvReceiptNoteHeadersDto, InputRcvReceiptNoteLinesDto, InputRcvShipmentHeadersDto, MstCategoriesServiceProxy, MstInventoryGroupServiceProxy, MstInventoryItemsServiceProxy, MstInventoryItemSubInventoriesServiceProxy, MstLineTypeServiceProxy, MstLocationsServiceProxy, MstOrganizationsServiceProxy, MstSupplierServiceProxy, MstUnitOfMeasureServiceProxy, PurchaseRequestServiceProxy, RcvReceiptNoteHeadersServiceProxy, RcvShipmentAttachmentsDto, RcvShipmentHeadersServiceProxy, RequestApprovalTreeServiceProxy, SupplierOutputSelectDto, UserServiceProxy } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { GlobalValidator } from '@shared/utils/validators';
import { Console } from 'console';
import * as saveAs from 'file-saver';
import { ceil } from 'lodash-es';
import { DateTime } from 'luxon';
import { isUndefined } from 'ngx-bootstrap/chronos/utils/type-checks';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'view-receipt-detail',
  templateUrl: './view-receipt-detail.component.html',
  styleUrls: ['./view-receipt-detail.component.less']
})
export class ViewReceiptDetailComponent extends AppComponentBase implements OnInit {
  @ViewChild("createOrEditModal", { static: true }) modal: ModalDirective;
  @ViewChild("submitBtn", { static: false }) submitBtn: ElementRef;
  @ViewChild('listAllReceiptNotes', { static: true }) listAllReceiptNotes!: TmssSelectGridModalComponent;
  @ViewChild('listAllReceipts', { static: true }) listAllReceipts!: TmssSelectGridModalComponent;
  @Output() close = new EventEmitter<any>();
  @ViewChild('viewDetailApprove', { static: true }) viewDetailApprove: ViewListApproveDetailComponent;
 // searchForm: FormGroup;
  createOrEditForm: FormGroup;
  isEdit = true;
  isSubmit = false;

  gridColDefDetail: CustomColDef[];
  gridRNotesDef: CustomColDef[];
  gridReceiptsDef: CustomColDef[];

  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  paginationParamsDetail: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParamsPrDetail: GridParams | undefined;

  selectedRowPrDetail;
  selectedReceiptRow;
  suppliers: SupplierOutputSelectDto[] = [];
  frameworkComponents;
  isLoading = false;
  selectedNode;
  inputRcvShipmentHeadersDto: InputRcvShipmentHeadersDto = new InputRcvShipmentHeadersDto()
  listPoLineDetail: GetRcvShipmentLineForEditDto[] = [];

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
  approveStatusList;
  downloadUrl: string = "";
  receiptType: number;
  selectedRowAttachment: RcvShipmentAttachmentsDto = null;
  attColDef: CustomColDef[] = [];
  @Input() uploadData: RcvShipmentAttachmentsDto[] = [];

  @Input('params') params: any;
  gridParamsAttachment: GridParams | undefined;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private _service: RcvShipmentHeadersServiceProxy,

    private mstSupplierServiceProxy: MstSupplierServiceProxy,
    private mstLocationsServiceProxy: MstLocationsServiceProxy,
    private _subInventories: MstInventoryItemSubInventoriesServiceProxy,
    private _commonService: CommonGeneralCacheServiceProxy,
    private _httpClient: HttpClient,
    private _approvalProxy: RequestApprovalTreeServiceProxy,
    private _fileDownloadService: FileDownloadService
  ) {
    super(injector);
    this.frameworkComponents = {
      agDatepickerRendererComponent: AgDatepickerRendererComponent,
      agSelectRendererComponent: AgDropdownRendererComponent,
      agCheckboxRendererComponent: AgCheckboxRendererComponent,
    };

    this.gridColDefDetail = [

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
        width: 150
      },
      {
        headerName: this.l('QuantityShipped'),
        headerTooltip: this.l('QuantityShipped'),
        field: 'quantityShipped',
        width: 150,
      },
      {
        headerName: this.l('PoNo'),
        headerTooltip: this.l('PoNo'),
        field: 'poNo',
        width: 150,
      },
      {
        headerName: this.l('Note'),
        headerTooltip: this.l('Note'),
        field: 'remark',
        width: 200,
      },
     {
        headerName: this.l('UnitOfMeasure'),
        headerTooltip: this.l('UnitOfMeasure'),
        field: 'unitOfMeasure',
        width: 100
      },
      {
        headerName: this.l('Category'),
        headerTooltip: this.l('Category'),
        field: 'categoryDesc',
        width: 300,
      },
      {
        headerName: this.l('DestinationType'),
        headerTooltip: this.l('DestinationType'),
        field: 'destinationTypeCode',

        width: 150,
      },
      {
        headerName: this.l('DeliverToLocation'),
        headerTooltip: this.l('DeliverToLocation'),
        field: 'locationCode',
        //tooltipValueGetter: (params: ITooltipParams) => params?.data ? this.listLocationCombo.find(e => e.key === params.data.catId)?.value : '',
        width: 150,
      },
      {
        headerName: this.l('ToSubinventory'),
        headerTooltip: this.l('ToSubinventory'),
        field: 'toSubinventory',
        editable: true,
        width: 150,
      },
      {
        headerName: this.l('CountryOfOriginCode'),
        headerTooltip: this.l('CountryOfOriginCode'),
        field: 'countryOfOriginCode',
        width: 150,
      },
      {
        headerName: this.l('CreationTime'),
        headerTooltip: this.l('CreationTime'),
        field: 'creationTime',
        width: 150,
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.creationTime) : "",
      },
      {
        headerName: this.l('CreatorUserName'),
        headerTooltip: this.l('CreatorUserName'),
        field: 'creatorUserName',
        width: 100,
      },
    ];

    this.gridReceiptsDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
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
      }
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

    this.downloadUrl = `${AppConsts.remoteServiceBaseUrl}/DownloadFile/GetGrAttachFileToDownload`;

    this._commonService.getDocumentByProcessType('GR').subscribe(
      res => {
          res.forEach(e =>
          this.listDocument.push({ value: e.id, label: e.documentCode + '-' + e.documentName }));
    });
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

    //this.receiptStatusList = this.params?.receiptStatusList;
    this.approveStatusList = this.params?.approveStatusList;
    this.receiptType = this.params?.receiptType;

    //edit
    if (this.params?.editId){
      console.log(this.params?.selectedReceiptRow);
      this.selectedReceiptRow = this.params?.selectedReceiptRow;
      this.createOrEditForm.patchValue(this.params?.selectedReceiptRow);
      this.receiptStatusList = [...this.receiptStatusList];
      this._service.getAllAttachmentsByHeaderID(this.params?.editId)
      .pipe(finalize(() => this.spinnerService.hide()))
      .subscribe((res) => {
        console.log(res)
          this.uploadData = res;
          this.gridParamsAttachment.api.setRowData(this.uploadData);
      });
      this.fillReceiptDetail(this.params.editId);
      // var header = this._service.getGoodsReceiptByIdForView(this.params.editId).subscribe((res) => {
      //   this.createOrEditForm.patchValue(res);
      //   this.fillReceiptDetail(this.params.editId);
      // });
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
      isInventory: [undefined],
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
    this.fillReceiptDetail(this.createOrEditForm.get("id").value);
  }

  fillReceiptDetail(id){
    this.spinnerService.show();

    this._service.getGoodsReceiptDetail(id)
    .pipe(finalize(()=> {
      this.spinnerService.hide();
    })).subscribe((val) => {
      this.listPoLineDetail= val.items;
      this.gridParamsPrDetail.api.setRowData(this.listPoLineDetail);
      this.paginationParamsDetail.totalCount = val.totalCount;
      this.paginationParamsDetail.totalPage = ceil(val.totalCount / this.paginationParamsDetail.pageSize);
      // this.gridParamsPrDetail.api.sizeColumnsToFit();
    });
  }

  callBackGridPrDetail(params: GridParams) {
    this.gridParamsPrDetail = params;
    params.api.setRowData([]);
  }


  getAllReceipts(suplierName: any, paginationParams: PaginationParamsModel) {
    return this._service.getAllReceipts(
      "",
      this.createOrEditForm.get("vendorId").value,
      this.createOrEditForm.get("vendorSiteId").value,
      -1,
      null,
      this.receiptType,
      null,
      null,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 100),
      (this.paginationParams ? this.paginationParams.skipCount : 1)
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

  closeForm(){}

  printReceipt(){

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

  onChangeSelectionAttachment(params: GridParams) {
    const selectedRows = params.api.getSelectedRows();
    if (selectedRows) {
      this.selectedRowAttachment = selectedRows[0];
    }
    //this.attachFileParams.api.forEachNode((node: RowNode) => { if (node.isSelected()) this.selectedNodeAttachment = node; });
  }

  cancelReceipt(){
    let id = this.createOrEditForm.get("id").value
    if (this.createOrEditForm.get("status").value > 0){
      this.notify.warn("Nhận hàng không ở trạng thái có thể hủy");
      return;
    }
    if (this.createOrEditForm.get("authorizationStatus").value == "APPROVED") {
      this.notify.warn("Nhận hàng đã được duyệt, không thể hủy!");
      return;
    }
    if (id && id> 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._service.cancelReceipt(id)
          .pipe(finalize(() => this.spinnerService.hide()))
          .subscribe(val => {
            this.notify.success('Successfully Canceled');
            this.createOrEditForm.get("status").setValue(2);
            this.receiptStatusList = [...this.receiptStatusList]
          });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit))
    }
  }

  sendRequest() {
    if (this.createOrEditForm.get('authorizationStatus').value == "APPROVED") {
      this.notify.warn("Nhận hàng đã được duyệt, không thể gửi!");
      return;
    }

    if (this.createOrEditForm.get('status').value == 2) {
      this.notify.warn("Nhận hàng đã được hủy, không thể gửi!");
      return;
    }

    let id = this.createOrEditForm.get("id").value;

    this.viewDetailApprove.showModal(id, 'GR');

    // if (this.selectedRows.length > 0){
    //     this._approvalProxy.checkRequestNextMultipleApprovalTree('SR',this.selectedRows.map(e => e.id)).subscribe(res => {
    //         this.viewDetailApprove.showModal(this.selectedRows[0].id, 'SR',this.selectedRows.map(e => e.id));
    //     })

    // }
    // else {
    //     this.notify.warn(this.l('SelectLine'));
    // }
    // // if (this.selectedRow ) {

    // //     this.viewDetailApprove.showModal(this.selectedRow.id, 'SR');
    // //   } else {
    // //     this.notify.warn(this.l('SelectLine'));
    // //   }

    // let id = this.createOrEditForm.get("id").value

    // if (id != undefined && id > 0) {
    //   let body = Object.assign(new CreateRequestApprovalInputDto(), {
    //     reqId: id,
    //     processTypeCode: 'GR'
    //   })
    //   this.message.confirm(this.l('AreYouSure'), this.l('SendRequestApprove'), (isConfirmed) => {
    //     if (isConfirmed) {
    //       this.spinnerService.show();
    //       this._approvalProxy.createRequestApprovalTree(body)
    //         .pipe(finalize(() => {
    //           this.spinnerService.hide();
    //         }))
    //         .subscribe(res => {
    //           this.notify.success(this.l('Successfully'));
    //           this.createOrEditForm.get('authorizationStatus').setValue('PENDING');
    //       })
    //     }
    //   })
    // } else {
    //   this.notify.warn(this.l('SelectLine'));
    // }
  }

  export() {
    this.spinnerService.show();

    this._service.exportGRDetail(this.createOrEditForm.get("id").value)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(blob => {
        this._fileDownloadService.downloadTempFile(blob);
        this.notify.success(this.l('SuccessfullyExported'));
      });
  }
}
