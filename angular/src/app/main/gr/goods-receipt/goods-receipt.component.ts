import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild, AfterViewInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TABS } from '@app/shared/constants/tab-keys';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, CreateRequestApprovalInputDto, InputRcvShipmentHeadersDto, MstSupplierServiceProxy, PaymentHeadersServiceProxy, ProfileServiceProxy, RcvShipmentHeadersServiceProxy, RequestApprovalTreeServiceProxy, SearchAllReceiptsDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditGoodsReceiptComponent } from './create-or-edit-goods-receipt/create-or-edit-goods-receipt.component';
import { FileDownloadService } from '@shared/utils/file-download.service';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';
@Component({
  selector: 'app-goods-receipts',
  templateUrl: './goods-receipt.component.html',
  styleUrls: ['./goods-receipt.component.less']
})
export class GoodsReceiptComponent extends AppComponentBase implements OnInit {
  @Output() changeTabCode: EventEmitter<{ addRegisterNo: string }> = new EventEmitter();
  @Output() autoReloadWhenDisplayTab: EventEmitter<{ reload: boolean, registerNo?: string,reloadTabHasRegisterNo?: string, tabCodes?: string[], key: string }> = new EventEmitter();

  @Input() receiptNum: any;
  @ViewChild('viewDetailApprove', { static: true }) viewDetailApprove: ViewListApproveDetailComponent;

  searchForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  gridParams: GridParams | undefined;
  listReceipts: InputRcvShipmentHeadersDto[] = [];
  countTabReceipt: number = 10;
  countTabAcceptance: number = 100;

  selectedRow: InputRcvShipmentHeadersDto = new InputRcvShipmentHeadersDto();

  listSupplierAll: { label: string, value: string | number }[] = [];
  listSupplier: { label: string, value: string | number }[] = [];
  siteListAll: { supplierId: number, id: number, vendorSiteCode: string }[] = [];
  siteList: { label: string, value: string | number }[] = [{ value: -1, label: 'Tất cả' }];

  employeeListAll: { value: number, title: string, label: string }[] = [];

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

  supplierContactId: number;
  currentSupplierId: number = undefined;
  currentSiteId: number = undefined;

  @Input() params: any;
  receiptType: number;

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService : DataFormatService,
    private eventBus: EventBusService,
    private _service: RcvShipmentHeadersServiceProxy,
    private mstSupplierServiceProxy: MstSupplierServiceProxy,
    private _commonService: CommonGeneralCacheServiceProxy,
    private _paymentHeadersServiceProxy: PaymentHeadersServiceProxy,
    private _profileService: ProfileServiceProxy,
    private _approvalProxy: RequestApprovalTreeServiceProxy,
    private _fileDownloadService: FileDownloadService
  ) {
    super(injector);
    this.gridColDef = [
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        flex: 0.5,
      },
      {
        headerName: this.l('ReceiptNum'),
        headerTooltip: this.l('ReceiptNum'),
        field: 'receiptNum',
        flex: 1,
      },
      {
        headerName: this.l('ReceiptDate'),
        headerTooltip: this.l('ReceiptDate'),
        field: 'receivedDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.receivedDate): "",
        flex: 1,
        hide: this.receiptType == 1
      },
      {
        headerName: this.l('ServiceStartDate'),
        headerTooltip: this.l('ServiceStartDate'),
        field: 'serviceStartDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.serviceStartDate): "",
        flex: 1,
        hide: this.receiptType == 0
      },
      {
        headerName: this.l('Vendor'),
        headerTooltip: this.l('Vendor'),
        field: 'vendorName',
        flex: 3,
      },
      // {
      //   headerName: this.l('VendorSiteCode'),
      //   headerTooltip: this.l('VendorSiteCode'),
      //   field: 'vendorSiteCode',
      //   flex: 1,
      // },
      {
        headerName: this.l('ApproveStatus'),
        headerTooltip: this.l('ApproveStatus'),
        field: 'authorizationStatus',
        flex: 1,
      },
      {
        headerName: this.l('Status'),
        field: 'status',
        valueGetter: params => (params.data ) ? this.receiptStatusList.find(e => e.value == params.data!.status)?.label : "",
        sortable: true,
    },

    ];

    this.getSupplierList();
  }

  ngOnInit(): void {
    this.receiptType = this.params?.key?? 0;

    this.buildForm();

  }

  ngAfterViewInit(){
    // console.log(this.receiptNum)
    // this.receiptNum.focus();
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
  }

  getSiteList(supplierIdFilter) {
    this.siteList = [{ value: -1, label: 'Tất cả' }];
    this.siteListAll.filter(e => e.supplierId == supplierIdFilter)
      .forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));

    if(this.siteList != undefined && this.siteList.length == 2){
        this.searchForm.get("sVendorSiteId").setValue(this.siteList[1].value);
    }
    // this.mstSupplierServiceProxy.getAllSupplierSiteBySupplierIdNotPaged(supplierIdFilter, "").subscribe(
    //   res => {
    //     res.forEach(e => this.siteList.push({ value: e.id, label: e.vendorSiteCode }));
    //   });
  }

  onChangeSelection(params) {
    this.selectedRow = params.api.getSelectedRows()[0] ?? new InputRcvShipmentHeadersDto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    this.gridParams.columnApi.setColumnVisible('receivedDate', this.receiptType == 0);
    this.gridParams.columnApi.setColumnVisible('serviceStartDate', this.receiptType == 1);
    params.api.setRowData([]);
  }

  buildForm() {
    this.searchForm = this.formBuilder.group({
      sReceiptNum: [undefined],
      sVendorId: [undefined],
      sVendorSiteId: [undefined],
      sStatus: [-1],
      sApproveStatus: [undefined],
      sReceivedDateFrom: [undefined],
      sReceivedDateTo: [undefined],
    });

    this.searchForm.get("sVendorId").valueChanges.subscribe(selectedValue => {
      this.searchForm.get("sVendorSiteId").setValue(-1);
      this.getSiteList(selectedValue);
    });

    this.searchForm.get("sVendorSiteId").valueChanges.subscribe(selectedValue => {
     this.currentSiteId = selectedValue;
    });
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listReceipts) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchReceipts();
  }

  searchReceipts() {
    this.spinnerService.show();
    this._service.getAllReceipts(
      this.searchForm.get('sReceiptNum').value,
      this.searchForm.get('sVendorId').value,
      this.searchForm.get('sVendorSiteId').value,
      this.searchForm.get('sStatus').value,
      this.searchForm.get('sApproveStatus').value,
      this.receiptType,
      this.searchForm.get('sReceivedDateFrom').value,
      this.searchForm.get('sReceivedDateTo').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1)
    ).pipe(finalize(()=> {
        this.spinnerService.hide();
      })).subscribe((val) => {
        this.listReceipts = val.items;

        this.gridParams.api.setRowData(this.listReceipts);
        this.paginationParams.totalCount = val.totalCount;
        this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);
        this.gridParams.api.sizeColumnsToFit();
      });
  }

  addNewReceipt() {
    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.CREATE_OR_EDIT_GR_FROM_RECEIPT_NOTES, //TABS.CREATE_OR_EDIT_GOODS_RECEIPT,
      tabHeader: (this.receiptType == 0 ? this.l('createGoodsReceipt'): this.l('createServiceReceipt')) ,
      params: {
        data: {
          countTab: this.receiptType == 0 ? this.countTabReceipt.toString(): this.countTabAcceptance.toString(),
          editId: null,
          selectedReceiptRow: this.selectedRow,
          employeeListAll: this.employeeListAll,
          listSupplier: this.listSupplier,
          siteListAll: this.siteListAll,
          receiptType: this.receiptType,
          currentSupplierId: this.currentSupplierId,
          currentSiteId: this.currentSiteId,
        }
      }
    });
    if (this.receiptType == 0)
      this.countTabReceipt += 1;
    else
      this.countTabAcceptance += 1;
  }

 editReceipt() {
  this.eventBus.emit({
    type: 'openComponent',
    functionCode: TABS.CREATE_OR_EDIT_GR_FROM_RECEIPT_NOTES,
    tabHeader: (this.receiptType == 0 ? this.l('editGoodsReceipt'): this.l('editServiceReceipt')) + '-' + this.selectedRow.receiptNum,
    params: {
      data: {
        countTab: this.receiptType == 0 ? this.countTabReceipt.toString(): this.countTabAcceptance.toString(),
        editId: this.selectedRow.id,
        selectedReceiptRow: this.selectedRow,
        employeeListAll: this.employeeListAll,
        listSupplier: this.listSupplier,
        siteListAll: this.siteListAll,
        receiptType: this.receiptType,
        currentSupplierId: this.currentSupplierId,
        currentSiteId: this.currentSiteId,
      }
    }
  });
  if (this.receiptType == 0)
    this.countTabReceipt += 1;
  else
    this.countTabAcceptance += 1;
}

  addNewReceiptFromPO(){
    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.CREATE_OR_EDIT_GOODS_RECEIPT,
      tabHeader:(this.receiptType == 0 ?  this.l('AddGRFromPO'): this.l('AddGRServiceFromPO')),
      params: {
        data: {
          countTab: this.receiptType == 0 ? this.countTabReceipt.toString(): this.countTabAcceptance.toString(),
          editId: this.selectedRow.id,
          selectedReceiptRow: this.selectedRow,
          employeeListAll: this.employeeListAll,
          listSupplier: this.listSupplier,
          siteListAll: this.siteListAll,
          receiptType: this.receiptType,
          currentSupplierId: this.currentSupplierId,
          currentSiteId: this.currentSiteId,
        }
      }
    });
    if (this.receiptType == 0)
      this.countTabReceipt += 1;
    else
      this.countTabAcceptance += 1;
  }


  viewDetail() {
    if (this.selectedRow.receiptNum == undefined){
      this.notify.warn("Chọn 1 bản ghi để hiển thị!")
      return;
    }

    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.VIEW_GOODS_RECEIPT,
      tabHeader: (this.receiptType == 0 ? this.l('viewGoodsReceipt'): this.l('viewServiceReceipt')) + '-' + this.selectedRow.receiptNum,
      params: {
        data: {
          countTab: this.receiptType == 0 ? this.countTabReceipt.toString(): this.countTabAcceptance.toString(),
          editId: this.selectedRow.id,
          selectedReceiptRow: this.selectedRow,
          receiptStatusList: this.receiptStatusList,
          approveStatusList: this.approveStatusList,
          receiptType: this.receiptType,
          currentSupplierId: this.currentSupplierId
        }
      }
    });
    if (this.receiptType == 0)
      this.countTabReceipt += 1;
    else
      this.countTabAcceptance += 1;
  };

  printReceipt(){

  }

  sendRequest() {
  if (this.selectedRow.authorizationStatus == "APPROVED") {
      this.notify.warn("Nhận hàng đã được duyệt, không thể gửi!");
      return;
    }

    if (this.selectedRow.status == 2) {
      this.notify.warn("Nhận hàng đã được hủy, không thể gửi!");
      return;
    }

      let id = this.selectedRow.id;

      this.viewDetailApprove.showModal(id, 'GR');
    // if (this.selectedRow.authorizationStatus == "APPROVED") {
    //   this.notify.warn("Nhận hàng đã được duyệt, không thể gửi!");
    //   return;
    // }

    // if (this.selectedRow.status == 2) {
    //   this.notify.warn("Nhận hàng đã được hủy, không thể gửi!");
    //   return;
    // }

    // if (this.selectedRow.id && this.selectedRow.id > 0) {
    //   let body = Object.assign(new CreateRequestApprovalInputDto(), {
    //     reqId: this.selectedRow.id,
    //     processTypeCode: 'GR'
    //   })
    //   this.message.confirm(this.l('AreYouSure'), this.l('SendRequestApprove'), (isConfirmed) => {
    //     if (isConfirmed) {
    //       this.spinnerService.show();
    //       this._approvalProxy.createRequestApprovalTree(body)
    //         .pipe(finalize(() => {
    //           this.spinnerService.hide();
    //           this.searchReceipts();
    //         }))
    //         .subscribe(res => this.notify.success(this.l('Successfully')))
    //     }
    //   })
    // } else {
    //   this.notify.warn(this.l('SelectLine'));
    // }
  }

  cancelReceipt(){
    if (this.selectedRow.authorizationStatus == "APPROVED") {
      this.notify.warn("Nhận hàng đã được duyệt, không thể hủy!");
      return;
    }

    if (this.selectedRow.status == 2) {
      this.notify.warn("Nhận hàng đã được hủy!");
      return;
    }

    if (this.selectedRow.id && this.selectedRow.id > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this._service.cancelReceipt(this.selectedRow.id)
          .pipe(finalize(() => this.spinnerService.hide()))
          .subscribe(val => {
            this.notify.success('Successfully Canceled');
            this.searchReceipts();
          });
        }
      });
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Edit))
    };
  }

  export() {
    this.spinnerService.show();
    let body = new SearchAllReceiptsDto();
    body = Object.assign({
      receiptNum: this.searchForm.get('sReceiptNum').value,
      vendorId: this.searchForm.get('sVendorId').value,
      vendorSiteId: this.searchForm.get('sVendorSiteId').value,
      status: this.searchForm.get('sStatus').value,
      approveStatus: this.searchForm.get('sApproveStatus').value,
      receiptType: this.receiptType,
      receivedDateFrom: this.searchForm.get('sReceivedDateFrom')?.value?? undefined,
      receivedDateTo: this.searchForm.get('sReceivedDateTo')?.value?? undefined
    });

    this._service.exportGR(body)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(blob => {
        this._fileDownloadService.downloadTempFile(blob);
        this.notify.success(this.l('SuccessfullyExported'));
      });
  }
}
