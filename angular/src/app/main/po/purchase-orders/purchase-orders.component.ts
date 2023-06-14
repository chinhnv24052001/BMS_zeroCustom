import { ICellRendererParams, ValueGetterParams } from '@ag-grid-enterprise/all-modules';
import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Injector, Input, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TmssSelectGridModalComponent } from '@app/shared/common/grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { ViewListApproveDetailComponent } from '@app/shared/common/view-list-approve-detail/view-list-approve-detail.component';
import { TABS } from '@app/shared/constants/tab-keys';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, CreateRequestApprovalInputDto, GetPurchaseOrdersDto, GetPurchaseRequestDto, InputSearchPoDto, MstInventoryGroupServiceProxy, MstLocationsServiceProxy, MstSupplierServiceProxy, PurchaseOrdersServiceProxy, PurchaseRequestServiceProxy, RequestApprovalTreeServiceProxy, RequestNextApprovalTreeInputDto } from '@shared/service-proxies/service-proxies';
import { FileDownloadService } from '@shared/utils/file-download.service';
import * as saveAs from 'file-saver';
import { ceil } from 'lodash';
import { finalize } from 'rxjs/operators';
import { CreateOrEditPurchaseOrdersComponent } from './create-or-edit-purchase-orders/create-or-edit-purchase-orders.component';
import { ImportPurchaseOrdersComponent } from './import-purchase-orders/import-purchase-orders.component';
import { NoteModalSupplierConfirmComponent } from './note-modal-supplier-confirm/note-modal-supplier-confirm.component';
import { ViewDetailPurchaseOrdersComponent } from './view-detail-purchase-orders/view-detail-purchase-orders.component';

@Component({
  selector: 'app-purchase-orders',
  templateUrl: './purchase-orders.component.html',
  styleUrls: ['./purchase-orders.component.less']
})
export class PurchaseOrdersComponent extends AppComponentBase implements OnInit {

  @ViewChild('supplierConfirmModal', { static: true }) supplierConfirmModal: NoteModalSupplierConfirmComponent;
  @ViewChild('createOrEditPurchaseOrders', { static: true }) createOrEditPurchaseOrders: CreateOrEditPurchaseOrdersComponent;
  @ViewChild('importPurchaseOrders', { static: true }) importPurchaseOrders: ImportPurchaseOrdersComponent;
  @ViewChild('viewDetailPo', { static: true }) viewDetailPo: ViewDetailPurchaseOrdersComponent;
  @ViewChild('listBuyer', { static: true }) listBuyer!: TmssSelectGridModalComponent;
  @ViewChild('listSupplierPopup', { static: true }) listSupplierPopup!: TmssSelectGridModalComponent;
  @ViewChild('listLocationBill', { static: true }) listLocationBill!: TmssSelectGridModalComponent;
  @ViewChild('listLocationShip', { static: true }) listLocationShip!: TmssSelectGridModalComponent;
  @ViewChild('viewDetailApprove', { static: true }) viewDetailApprove: ViewListApproveDetailComponent;
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  @Output() changeTabCode: EventEmitter<{ addRegisterNo: string }> = new EventEmitter();
  @Output() autoReloadWhenDisplayTab: EventEmitter<{ reload: boolean, registerNo?: string, reloadTabHasRegisterNo?: string, tabCodes?: string[], key: string }> = new EventEmitter();
  purchaseOrdersForm: FormGroup;
  listPurchaseOrders: GetPurchaseOrdersDto[];
  gridColDef: CustomColDef[];
  buyerDefs: CustomColDef[];
  locationDefs: CustomColDef[];
  supplierDefs: CustomColDef[];
  gridParams: GridParams | undefined;
  listPerparers: { label: string, value: string | number }[] = [];
  listBillToLocations: { label: string, value: string | number }[] = [];
  listShipToLocations: { label: string, value: string | number }[] = [];
  listLocations: { label: string, value: string | number }[] = [];
  listBuyers: { label: string, value: string | number }[] = [];
  listSuppliers: { label: string, value: string | number }[] = [];
  listInventoryGroups: { label: string, value: string | number }[] = [];
  countTab: number = 0;
  selectedRow: GetPurchaseOrdersDto = new GetPurchaseOrdersDto();
  selectedRows: GetPurchaseOrdersDto[] = [];
  @Input() params: any;
  tabKey: number = 1;
  urlBase: string = AppConsts.remoteServiceBaseUrl;
  isDisabled: boolean = false;

  approvalStatus: { label: string, value: string }[] = [
    { label: this.l('All'), value: undefined },
    { label: this.l('New'), value: 'NEW' },
    { label: this.l('Pending'), value: 'PENDING' },
    { label: this.l('Approved'), value: 'APPROVED' },
    { label: this.l('Rejected'), value: 'REJECT' }
  ];

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private eventBus: EventBusService,
    private mstLocationsServiceProxy: MstLocationsServiceProxy,
    private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
    private purchaseOrdersServiceProxy: PurchaseOrdersServiceProxy,
    private _approvalProxy: RequestApprovalTreeServiceProxy,
    private purchaseRequestServiceProxy: PurchaseRequestServiceProxy,
    private mstSupplierServiceProxy: MstSupplierServiceProxy,
    private mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
    private _http: HttpClient,
    private _fileDownloadService: FileDownloadService
  ) {
    super(injector);
  }

  ngOnInit(): void {
    if (this.params?.key === 1) {
      this.tabKey = 1;
    } else {
      this.tabKey = 2;
    }
    this.buildForm();
    if (this.params?.purchaseOrder != null) {
      this.purchaseOrdersForm.get('ordersNo').setValue(this.params?.purchaseOrder);
    }
    this.gridColDef = [
      {
        headerName: "",
        headerTooltip: "",
        field: "checked",
        headerClass: ["align-checkbox-header"],
        cellClass: ["check-box-center"],
        checkboxSelection: true,
        headerCheckboxSelection: true,
        headerCheckboxSelectionFilteredOnly: true,
        width: 1,
      },
      {
        // STT
        headerName: this.l('STT'),
        headerTooltip: this.l('STT'),
        cellRenderer: (params: ICellRendererParams) => ((this.paginationParams.pageNum! - 1) * this.paginationParams.pageSize! + params.rowIndex + 1).toString(),
        maxWidth: 50,
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('OrdersNumber'),
        headerTooltip: this.l('OrdersNumber'),
        field: 'ordersNo',
        maxWidth: 120,
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('Description'),
        headerTooltip: this.l('Description'),
        field: 'description',
        cellClass: ['cell-border'],
      },
      {
        headerName: this.l('InventoryGroup'),
        headerTooltip: this.l('InventoryGroup'),
        field: 'productGroupName',
        cellClass: ['cell-border'],
        validators: ['required'],
        width: 120,
      },
      {
        headerName: this.l('Type'),
        headerTooltip: this.l('Type'),
        field: 'typeLookupCode',
        maxWidth: 120,
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('ApproveStatus'),
        headerTooltip: this.l('ApproveStatus'),
        field: 'authorizationStatus',
        maxWidth: 150,

        valueGetter: (params: ValueGetterParams) => this.handleStatus(params.data?.authorizationStatus, params.data?.departmentApprovalName),
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('VendorConfirm'),
        headerTooltip: this.l('VendorConfirm'),
        field: 'isVendorConfirm',
        maxWidth: 70,
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('NoteOfSupplier'),
        headerTooltip: this.l('NoteOfSupplier'),
        field: 'noteOfSupplier',
      },
      {
        headerName: this.l('RequestNote'),
        headerTooltip: this.l('RequestNote'),
        field: 'requestNote',
      },
      {
        headerName: this.l('ReplyNote'),
        headerTooltip: this.l('ReplyNote'),
        field: 'replyNote',
      },
      {
        headerName: this.l('OrderDate'),
        headerTooltip: this.l('OrderDate'),
        field: 'orderDate',
        valueFormatter: param => param.data ? this.dataFormatService.dateFormat(param.data.orderDate) : "",
        maxWidth: 130,
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('Supplier'),
        headerTooltip: this.l('Supplier'),
        field: 'supplierName',
      },
      {
        headerName: this.l('SupplierSite'),
        headerTooltip: this.l('Supplier'),
        field: 'vendorSiteCode',
      },
      {
        headerName: this.l('Currency'),
        headerTooltip: this.l('Currency'),
        field: 'currency',
        maxWidth: 100,
        cellClass: ['text-center', 'cell-border'],
      },
      {
        headerName: this.l('Amount'),
        headerTooltip: this.l('Amount'),
        field: 'amount',
        cellClass: ['cell-border', 'text-right'],
        valueGetter: (params: ValueGetterParams) => this.dataFormatService.formatMoney(params.data?.amount),
        maxWidth: 100,
      },
      // {
      //   headerName: this.l('MatchedAmount'),
      //   headerTooltip: this.l('MatchedAmount'),
      //   field: 'matchedAmount',
      //   cellClass: ['cell-border', 'text-right'],
      //   valueGetter: (params: ValueGetterParams) => this.dataFormatService.formatMoney(params.data?.matchedAmount),
      //   maxWidth: 100,
      // },
      {
        headerName: this.l('Buyer'),
        headerTooltip: this.l('Buyer'),
        field: 'buyerName',
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

    this.listLocations = [{ value: 0, label: 'Tất cả' }];
    this.commonGeneralCacheServiceProxy.getAllLocations().subscribe((res) => {
      res.forEach(e => this.listLocations.push({ label: e.locationCode, value: e.id }))
    });


    this.listInventoryGroups = [{ value: 0, label: 'Tất cả' }];
    this.mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
      res.forEach(e => this.listInventoryGroups.push({ label: e.productGroupName, value: e.id }))
    });

    this.commonGeneralCacheServiceProxy.getAllSuppliers().subscribe((res) => {
      this.listSuppliers = [{ value: 0, label: 'Tất cả' }];
      res.forEach(e => this.listSuppliers.push({ label: (e.supplierName), value: e.id }))
    });

    this.commonGeneralCacheServiceProxy.getAllUsersInfo().subscribe((res) => {
      this.listBuyers = [{ value: 0, label: 'Tất cả' }];
      res.forEach(e => this.listBuyers.push({ label: (e.name), value: e.id }))
    });
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listPurchaseOrders) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchPurchaseOrders();
  }

  onChangeSelection(params) {
    this.selectedRows = params.api.getSelectedRows();
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new GetPurchaseOrdersDto();
    this.selectedRow = Object.assign({}, this.selectedRow);

    if (this.selectedRow.creatorUserId === this.appSession.userId && (this.selectedRow.authorizationStatus === 'INCOMPLETE' || this.selectedRow.authorizationStatus === 'NEW')) {
      this.isDisabled = true;
    } else {
      this.isDisabled = false;
    }
  }

  callBackGrid(params: GridParams) {
    params.columnApi.setColumnVisible('authorizationStatus', this.tabKey !== 2);
    params.columnApi.setColumnVisible('replyNote', this.tabKey !== 2);
    params.columnApi.setColumnVisible('requestNote', this.tabKey !== 2);
    this.gridParams = params;
    params.api.setRowData([]);
  }

  buildForm() {
    this.purchaseOrdersForm = this.formBuilder.group({
      ordersNo: [undefined],
      supplierId: [undefined],
      supplierName: [undefined],
      billToLocationId: [undefined],
      billToLocationName: [undefined],
      shipToLocationId: [undefined],
      shipToLocationName: [undefined],
      inventoryGroupId: [undefined],
      buyerId: [undefined],
      buyerName: [undefined],
      status: [undefined],
      fromDate: [undefined],
      toDate: [undefined],
    });
    this.searchPurchaseOrders();
  }

  showSearchBuyer() {
    this.listBuyer.show(this.purchaseOrdersForm.get('buyerName').value);
  }

  showSearchSupplier() {
    this.listSupplierPopup.show(this.purchaseOrdersForm.get('supplierName').value);
  }

  showSearchBillLocation() {
    this.listLocationBill.show(this.purchaseOrdersForm.get('billToLocationName').value);
  }

  showSearchShipLocation() {
    this.listLocationShip.show(this.purchaseOrdersForm.get('shipToLocationName').value);
  }

  patchBuyer(event: any) {
    this.purchaseOrdersForm.get('buyerName').setValue(event.name);
    this.purchaseOrdersForm.get('buyerId').setValue(event.id);
  }

  patchSupplier(event: any) {
    this.purchaseOrdersForm.get('supplierName').setValue(event.supplierName);
    this.purchaseOrdersForm.get('supplierId').setValue(event.id);
  }

  patchLocationBill(event: any) {
    this.purchaseOrdersForm.get('billToLocationName').setValue(event.locationCode);
    this.purchaseOrdersForm.get('billToLocationId').setValue(event.id);
  }

  patchLocationShip(event: any) {
    this.purchaseOrdersForm.get('shipToLocationName').setValue(event.locationCode);
    this.purchaseOrdersForm.get('shipToLocationId').setValue(event.id);
  }

  getAllBuyers(userName: any, paginationParams: PaginationParamsModel) {
    return this.purchaseRequestServiceProxy.getListRequester(userName,
      (paginationParams ? paginationParams.sorting : ''),
      (paginationParams ? paginationParams.pageSize : 20),
      (paginationParams ? paginationParams.skipCount : 1));
  }

  //#region api get list
  getAllSupplier(suplierName: any, paginationParams: PaginationParamsModel) {
    return this.mstSupplierServiceProxy.getAllSupplierNotPaged(
      suplierName ?? ''
    );
  }

  getAllLocations(locationCode: any, paginationParams: PaginationParamsModel) {
    return this.mstLocationsServiceProxy.getAllLocations(locationCode)
  }

  searchPurchaseOrders() {
    this.spinnerService.show();
    this.purchaseOrdersServiceProxy.getAllPurchaseOrders(
      this.purchaseOrdersForm.get('ordersNo').value,
      this.purchaseOrdersForm.get('supplierId').value,
      this.purchaseOrdersForm.get('billToLocationId').value,
      this.purchaseOrdersForm.get('shipToLocationId').value,
      this.purchaseOrdersForm.get('inventoryGroupId').value,
      this.purchaseOrdersForm.get('buyerId').value,
      (this.tabKey == 1 ? true : false),
      this.purchaseOrdersForm.get('status').value,
      this.purchaseOrdersForm.get('fromDate').value,
      this.purchaseOrdersForm.get('toDate').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((val) => {
        this.listPurchaseOrders = val.items;
        this.gridParams.api.setRowData(this.listPurchaseOrders);
        this.paginationParams.totalCount = val.totalCount;
        this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);
        // this.gridParams.api.sizeColumnsToFit();
      });
  }

  viewDetail() {
    if (this.selectedRow && this.selectedRow.id > 0) {
      this.viewDetailPo.show(this.selectedRow.id, this.isDisabled, this.tabKey);
    } else {
      this.notify.warn(this.l('SelectLine'));
    }

  }

  addPurchaseOrders() {
    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.CREATE_OR_EDIT_PURCHASE_ORDERS,
      tabHeader: this.l('CreateOrEditPurchaseOrder'),
      params: {
        data: {
          purchaseOrderId: 0
        }
      }
    });

    // this.createOrEditPurchaseOrders.showModal(undefined);
  }

  importPo() {
    this.importPurchaseOrders.show();
  }

  editPurchaseOrders() {

    if (this.selectedRow && this.selectedRow.id > 0) {
      this.eventBus.emit({
        type: 'openComponent',
        functionCode: TABS.CREATE_OR_EDIT_PURCHASE_ORDERS,
        tabHeader: this.l('CreateOrEditPurchaseOrder'),
        params: {
          data: {
            purchaseOrderId: this.selectedRow.id
          }
        }
      });

    }
    else {
      this.notify.warn(this.l('SelectLine'));
    }
  }

  deletePurchaseOrders() {
    if (this.selectedRows && this.selectedRows.length > 0) {
      this.message.confirm('', this.l(AppConsts.CPS_KEYS.Are_You_Sure), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();
          this.selectedRows.forEach(e => {
            this.purchaseOrdersServiceProxy.deletePurchaseOrders(e.id)
              .pipe(finalize(() => {
                this.spinnerService.hide();
              }))
              .subscribe(val => {
                this.searchPurchaseOrders();
                this.notify.success(AppConsts.CPS_KEYS.Successfully_Deleted);
              });
          })
        }
      });
    } else {
      this.notify.warn(this.l('SelectLine'));
    }
  }

  handleStatus(status: string, department: string) {
    switch (status) {
      case 'NEW':
        return this.l('New') + (department ? ` - ${department}` : '');
      case 'INCOMPLETE':
        return this.l('New') + (department ? ` - ${department}` : '');
      case 'PENDING':
        return this.l('Pending') + (department ? ` - ${department}` : '');
      case 'WAITTING':
        return this.l('Waitting') + (department ? ` - ${department}` : '');
      case 'APPROVED':
        return this.l('Approved') + (department ? ` - ${department}` : '');
      case 'REJECTED':
        return this.l('Rejected') + (department ? ` - ${department}` : '');
    }
  }

  sendRequest() {
    if (this.selectedRows.length > 0) {

      this.selectedRows.forEach(e => {
        if (e.supplierName) {
          this.notify.warn(this.l("HaveItemsVendorIsEmpty"));
          return;
        }
      });

      this._approvalProxy.checkRequestNextMultipleApprovalTree('PO', this.selectedRows.map(e => e.id)).subscribe(res => {
        this.viewDetailApprove.showModal(this.selectedRows[0].id, 'PO', this.selectedRows.map(e => e.id));
      })
    }
    else {
      this.notify.warn(this.l('SelectLine'));
    }
  }

  // sendRequest() {
  //   if (this.selectedRow && this.selectedRow.id > 0) {

  //     sendRequest() {
  //       if (this.selectedRows.length > 0){
  //           this._approvalProxy.checkRequestNextMultipleApprovalTree('SR',this.selectedRows.map(e => e.id)).subscribe(res => {
  //               this.viewDetailApprove.showModal(this.selectedRows[0].id, 'SR',this.selectedRows.map(e => e.id));
  //           })

  //       }
  //       else {
  //           this.notify.warn(this.l('SelectLine'));
  //       }


  //   }

  //     this.viewDetailApprove.showModal(this.selectedRow.id, 'PO');
  //   } else {
  //     this.notify.warn(this.l('SelectLine'));
  //   }
  // }
  //       let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
  confirmRequest() {
    this.message.confirm(this.l('AreYouSure'), this.l('SendRequestApprove'), (isConfirmed) => {
      if (isConfirmed) {
        this.spinnerService.show();
        this.selectedRows.forEach(e => {
          let body = Object.assign(new RequestNextApprovalTreeInputDto(), {
            reqId: e.id,
            processTypeCode: 'PO'
          })

          this._approvalProxy.requestNextApprovalTree(body)
            .pipe(finalize(() => {
              this.spinnerService.hide();
              this.searchPurchaseOrders();
            }))
            .subscribe(res => this.notify.success(this.l('Successfully')))
        })
      }
    })
  }

  supplierConfirm(type: number) {
    if (this.selectedRows && this.selectedRows.length > 0) {
      this.supplierConfirmModal.show(type, this.selectedRows);
    } else {
      this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line_To_Delete))
    }
  }

  print() {
    if (this.selectedRows && this.selectedRows.length > 0) {
      this.spinnerService.show();
      this.selectedRows.forEach(e => {
        this._http
          .post(
            `${this.urlBase}/api/PurchaseOrdersReport/printPurchaseOrdersSingle`,
            e.id,
            {
              responseType: "blob",
            }
          )
          .pipe(finalize(() => (this.spinnerService.hide())))
          .subscribe((blob) => saveAs(blob, "PrintPurchaseOrders.pdf"));
      });

    }
    else {
      this.notify.warn(this.l('SelectLine'));
    }
  }

  printDilevery() {
    this.spinnerService.show();
    if (this.selectedRows && this.selectedRows.length > 0) {
      this.selectedRows.forEach(e => {
        this._http
          .post(
            `${this.urlBase}/api/PurchaseOrdersReport/printPurchaseOrdersMulti`,
            e.id,
            {
              responseType: "blob",
            }
          )
          .pipe(finalize(() => (this.spinnerService.hide())))
          .subscribe((blob) => saveAs(blob, "PrintPurchaseOrdersMulti.pdf"));
      });
    }
    else {
      this.notify.warn(this.l('SelectLine'));
    }
  }

  export() {
    this.spinnerService.show();
    let body = new InputSearchPoDto();
    body = Object.assign({
      ordersNo: this.purchaseOrdersForm.get('ordersNo').value,
      supplierId: this.purchaseOrdersForm.get('supplierId').value,
      billToLocationId: this.purchaseOrdersForm.get('billToLocationId').value,
      shipToLocationId: this.purchaseOrdersForm.get('shipToLocationId').value,
      inventoryGroupId: this.purchaseOrdersForm.get('inventoryGroupId').value,
      buyerId: this.purchaseOrdersForm.get('buyerId').value,
      isInternal: (this.tabKey == 1 ? true : false),
      status: this.purchaseOrdersForm.get('status').value,
      fromDate: this.purchaseOrdersForm.get('fromDate').value,
      toDate: this.purchaseOrdersForm.get('toDate').value,
      sorting: (this.paginationParams ? this.paginationParams.sorting : ''),
      pageSize: (this.paginationParams ? this.paginationParams.pageSize : 20),
      skipCount: (this.paginationParams ? this.paginationParams.skipCount : 1)
    });

    this.purchaseOrdersServiceProxy.exportPo(body)
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe(blob => {
        this._fileDownloadService.downloadTempFile(blob);
        this.notify.success(this.l('SuccessfullyExported'));
      });
  }

  undoRequest() {
    if (this.selectedRow && this.selectedRow.id > 0) {
      this.message.confirm(this.l('AreYouSure'), this.l('UndoRequest'), (isConfirmed) => {
        if (isConfirmed) {
          this.spinnerService.show();

          this.spinnerService.show();
          this._approvalProxy.undoRequest(
            this.selectedRow.id,
            "PO"
          ).pipe(finalize(() => {
            this.spinnerService.hide();
            this.searchPurchaseOrders();
          }))
            .subscribe(res => this.notify.success(this.l('UndoSuccessfully')))

        }
      })
    } else {
      this.notify.warn(this.l('SelectLine'));
    }

  }
}

