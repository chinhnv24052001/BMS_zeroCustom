import { ICellRendererParams, ValueGetterParams } from '@ag-grid-community/core';
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TABS } from '@app/shared/constants/tab-keys';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { CommonGeneralCacheServiceProxy, GetPurchaseRequestForCreatePODto, InputPurchaseOrdersShipmentsDto, MstInventoryGroupServiceProxy, PurchaseOrdersServiceProxy, PurchaseRequestServiceProxy } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash';
import groupBy from 'lodash-es/groupBy';
import { finalize } from 'rxjs/operators';
import { CreateOrEditPurchaseOrdersComponent } from '../purchase-orders/create-or-edit-purchase-orders/create-or-edit-purchase-orders.component';
import { AddPurchaseRequestToPurchaseOrdersModalComponent } from './add-purchase-request-to-purchase-orders-modal/add-purchase-request-to-purchase-orders-modal.component';
import { AddDescriptionsForAutoCraetePoComponent } from './add-descriptions-for-auto-craete-po/add-descriptions-for-auto-craete-po.component';
import { UpdateInventoryGroupModalComponent } from './update-inventory-group-modal/update-inventory-group-modal.component';

@Component({
  selector: 'app-auto-create-purchase-orders',
  templateUrl: './auto-create-purchase-orders.component.html',
  styleUrls: ['./auto-create-purchase-orders.component.less']
})
export class AutoCreatePurchaseOrdersComponent extends AppComponentBase implements OnInit {

  @ViewChild('createOrEditPurchaseOrders', { static: true }) createOrEditPurchaseOrders: CreateOrEditPurchaseOrdersComponent;
  @ViewChild('addPrToPo', { static: true }) addPrToPo: AddPurchaseRequestToPurchaseOrdersModalComponent;
  @ViewChild('addDescriptions', { static: true }) addDescriptions: AddDescriptionsForAutoCraetePoComponent;
  @ViewChild('updateInventoryGroup', { static: true }) updateInventoryGroup: UpdateInventoryGroupModalComponent;
  listUsers: { label: string, value: string | number }[] = [];
  listSuppliers: { label: string, value: string | number }[] = [];
  listSuppliersSite: { label: string, value: string | number }[] = [];
  listDocumentTypes: { label: string, value: string | number }[] = [];
  autoCreatePurchaseOrdersForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 1000, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  @Output() changeTabCode: EventEmitter<{ addRegisterNo: string }> = new EventEmitter();
  @Output() autoReloadWhenDisplayTab: EventEmitter<{ reload: boolean, registerNo?: string, reloadTabHasRegisterNo?: string, tabCodes?: string[], key: string }> = new EventEmitter();
  gridParams: GridParams | undefined;
  listPurchaseRequest: GetPurchaseRequestForCreatePODto[];
  selectedRow;
  selectMultiRows: GetPurchaseRequestForCreatePODto[];
  countTab: number = 0;
  listInventoryGroups: { label: string, value: string | number }[] = [];

  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private purchaseRequestServiceProxy: PurchaseRequestServiceProxy,
    private eventBus: EventBusService,
    private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
    private purchaseOrdersServiceProxy: PurchaseOrdersServiceProxy,
    private mstInventoryGroupServiceProxy: MstInventoryGroupServiceProxy,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.buildForm();
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
        width: 50,
      },
      {
        headerName: this.l('RequisitionNo'),
        headerTooltip: this.l('RequisitionNo'),
        field: 'requisitionNo',
        cellClass: ['cell-border'],
        width: 100
      },
      {
        headerName: this.l('PartNo'),
        headerTooltip: this.l('PartNo'),
        field: 'partNo',
        cellClass: ['cell-border'],
        width: 100,
      },
      {
        headerName: this.l('PartName'),
        headerTooltip: this.l('PartName'),
        field: 'partName',
        cellClass: ['cell-border'],
        editable: true,
        validators: ['required'],
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
        headerName: this.l('InventoryGroup'),
        headerTooltip: this.l('InventoryGroup'),
        field: 'productGroupName',
        cellClass: ['cell-border'],
        validators: ['required'],
        width: 120,
      },
      {
        headerName: this.l('UOM'),
        headerTooltip: this.l('UOM'),
        field: 'unitMeasLookupCode',
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
        headerName: this.l('Price'),
        headerTooltip: this.l('Price'),
        field: 'unitPrice',
        validators: ['floatNumber'],
        cellClass: ['cell-border', 'text-right'],
        width: 70,
        valueFormatter: params => this.dataFormatService.floatMoneyFormat((params.value) ? params.value : 0),
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
        headerName: this.l('Amount'),
        headerTooltip: this.l('Amount'),
        field: 'amount',
        cellClass: ['cell-border', 'text-right'],
        valueFormatter: params => this.dataFormatService.floatMoneyFormat((params.value) ? params.value : 0),
        width: 70,
      },
      {
        headerName: this.l('Currency'),
        headerTooltip: this.l('Currency'),
        field: 'currency',
        cellClass: ['cell-border'],
        width: 80
      },
      {
        headerName: this.l('Requester'),
        headerTooltip: this.l('Requester'),
        field: 'requesterName',
        cellClass: ['cell-border'],
        validators: ['required'],
        width: 120,
      },
      {
        headerName: this.l('Supplier'),
        headerTooltip: this.l('Supplier'),
        field: 'suggestedVendorName',
        cellClass: ['cell-border'],
        width: 200,
      },
      {
        headerName: this.l('Site'),
        headerTooltip: this.l('Site'),
        field: 'suggestedVendorLocation',
        cellClass: ['cell-border'],
        width: 100,
      },
      // {
      //   headerName: this.l('Buyer'),
      //   headerTooltip: this.l('Buyer'),
      //   field: 'buyer',
      //   cellClass: ['cell-border'],
      //   width: 120,
      // }
    ];


    this.listSuppliers = [{ value: 0, label: 'Tất cả' }];
    this.listUsers = [{ value: 0, label: 'Tất cả' }];

    this.commonGeneralCacheServiceProxy.getAllSuppliers().subscribe((res) => {
      res.forEach(e => this.listSuppliers.push({ label: (e.supplierNumber + ' - ' + e.supplierName), value: e.id }))
    });

    this.commonGeneralCacheServiceProxy.getAllUsersInfo().subscribe((res) => {
      res.forEach(e => this.listUsers.push({ label: (e.userName + ' - ' + e.name), value: e.id }))
    })

    this.listInventoryGroups = [{ value: 0, label: 'Tất cả' }];
    this.mstInventoryGroupServiceProxy.getAllInventoryGroup().subscribe((res) => {
      res.forEach(e => this.listInventoryGroups.push({ label: e.productGroupName, value: e.id }))
    });

  }

  buildForm() {
    this.autoCreatePurchaseOrdersForm = this.formBuilder.group({
      requisitionNo: [undefined],
      preparerName: [undefined],
      preparerId: [undefined],
      buyerName: [undefined],
      buyerId: [undefined],
      fromDate: [undefined],
      toDate: [undefined],
      supplierId: [undefined],
      supplierSiteId: [undefined],
      documentTypeId: [undefined],
      inventoryGroupId: [undefined]
    });

    if (this.autoCreatePurchaseOrdersForm.get('supplierId')) {
      this.autoCreatePurchaseOrdersForm.get('supplierId').valueChanges.subscribe((val) => {
        this.listSuppliersSite = [{ value: 0, label: 'Tất cả' }];
        this.commonGeneralCacheServiceProxy.getAllSupplierSitesBySupplerId(val ?? 0).subscribe((res) => {
          res.forEach(e => this.listSuppliersSite.push({ label: e.vendorSiteCode, value: e.id }))
        });
      });
    }
    // this.searchPurchasePurpose();
  }

  searchPurchaseRequest() {
    this.spinnerService.show();
    this.purchaseRequestServiceProxy.getAllPurchaseRequestForCreatePO(
      this.autoCreatePurchaseOrdersForm.get('requisitionNo').value,
      this.autoCreatePurchaseOrdersForm.get('preparerId').value,
      this.autoCreatePurchaseOrdersForm.get('buyerId').value,
      this.autoCreatePurchaseOrdersForm.get('fromDate')?.value ?? undefined,
      this.autoCreatePurchaseOrdersForm.get('toDate')?.value ?? undefined,
      this.autoCreatePurchaseOrdersForm.get('supplierId').value,
      this.autoCreatePurchaseOrdersForm.get('supplierSiteId').value,
      this.autoCreatePurchaseOrdersForm.get('inventoryGroupId').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((val) => {
        this.listPurchaseRequest = val.items;

        this.gridParams.api.setRowData(this.listPurchaseRequest);
        this.paginationParams.totalCount = val.totalCount;
        this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);
        // this.gridParams.api.sizeColumnsToFit();
      });
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listPurchaseRequest) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchPurchaseRequest();
  }

  onChangeSelection(params) {
    this.selectMultiRows = params.api.getSelectedRows() ?? [];
    this.selectedRow =
      params.api.getSelectedRows()[0] ?? new GetPurchaseRequestForCreatePODto();
    this.selectedRow = Object.assign({}, this.selectedRow);
  }

  callBackGrid(params: GridParams) {
    this.gridParams = params;
    params.api.setRowData([]);
  }

  createManual() {
    let isInventorygroupIsEmpty = false;
    if (this.selectMultiRows.length > 0) {
      this.selectMultiRows.forEach(e => {
        if (!e.inventoryGroupId) {
          isInventorygroupIsEmpty = true;

        }
      });
      if (isInventorygroupIsEmpty) {
        this.notify.warn(this.l('InventorygroupIsEmpty'));
        return;
      }
      this.addDescriptions.show(this.selectMultiRows);
      // this.spinnerService.show();
      // this.purchaseOrdersServiceProxy.createPOFromPR(AppConsts.CPS_KEYS.TYPE_PR, this.selectMultiRows)
      //   .pipe(finalize(() => {
      //     this.spinnerService.hide();
      //   }))
      //   .subscribe((res) => {
      //     this.searchPurchaseRequest();
      //     this.notify.success(this.l('SuccessfullyCreatedPo', res.length));
      //     this.eventBus.emit({
      //       type: 'openComponent',
      //       functionCode: TABS.PURCHASE_ORDERS,
      //       tabHeader: this.l('PurchaseOrders'),
      //       params: {
      //           key: 1
      //       }
      //   });
      // res.forEach(e => {
      //   this.eventBus.emit({
      //     type: 'openComponent',
      //     functionCode: TABS.CREATE_OR_EDIT_PURCHASE_ORDERS,
      //     tabHeader: this.l('CreateOrEditPurchaseOrder'),
      //     params: {
      //       data: {
      //         countTab: e.poNumber,
      //         purchaseOrderId: e.id
      //       }
      //     }
      //   });
      //   this.changeTabCode.emit({ addRegisterNo: e.poNumber });
      //   this.autoReloadWhenDisplayTab.emit({ reload: true, registerNo: e.poNumber, reloadTabHasRegisterNo: e.poNumber, tabCodes: [TABS.CREATE_OR_EDIT_PURCHASE_REQUEST], key: TABS.PURCHASE_REQUEST })
      // })
      // })
    }
    else {
      this.notify.warn(this.l('SelectLine'));
    }

    // this.createOrEditPurchaseOrders.showModal(undefined, this.selectMultiRows);
  }

  addToPo() {
    if (this.selectMultiRows && this.selectMultiRows.length > 0) {
      var groupedInventoryGroups = groupBy(this.selectMultiRows, ur => ur.inventoryGroupId);
      if (Object.keys(groupedInventoryGroups).length === 1) {
        this.addPrToPo.show(this.selectMultiRows);
      }
      else {
        this.notify.warn(this.l('InventorygroupDouble'));
      }
    }
    else {
      this.notify.warn(this.l('SelectLine'));
    }
  }

  updateInvGroup() {
    if (this.selectMultiRows.length > 0) {

      this.updateInventoryGroup.show(this.selectMultiRows);
    }
    else {
      this.notify.warn(this.l('SelectLine'));
    }
  }

}
