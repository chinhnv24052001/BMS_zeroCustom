
import { ICellRendererParams } from '@ag-grid-enterprise/all-modules';
import { Component, EventEmitter, Injector, OnInit, Output, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TABS } from '@app/shared/constants/tab-keys';
import { CustomColDef, GridParams, PaginationParamsModel } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { AppConsts } from '@shared/AppConsts';
import { AppComponentBase } from '@shared/common/app-component-base';
import { PurchaseRequestServiceProxy, CommonGeneralCacheServiceProxy, GetPurchaseRequestForCreatePODto, PurchaseOrdersServiceProxy, GetContractForCreatePoDto } from '@shared/service-proxies/service-proxies';
import { ceil } from 'lodash-es';
import { finalize } from 'rxjs/operators';
import { CreateOrEditPurchaseOrdersComponent } from '../purchase-orders/create-or-edit-purchase-orders/create-or-edit-purchase-orders.component';

@Component({
  selector: 'app-auto-create-po-from-contract',
  templateUrl: './auto-create-po-from-contract.component.html',
  styleUrls: ['./auto-create-po-from-contract.component.less']
})
export class AutoCreatePoFromContractComponent extends AppComponentBase implements OnInit {


  @ViewChild('createOrEditPurchaseOrders', { static: true }) createOrEditPurchaseOrders: CreateOrEditPurchaseOrdersComponent;
  listUsers: { label: string, value: string | number }[] = [];
  listSuppliers: { label: string, value: string | number }[] = [];
  listSuppliersSite: { label: string, value: string | number }[] = [];
  listDocumentTypes: { label: string, value: string | number }[] = [];
  autoCreatePurchaseOrdersForm: FormGroup;
  gridColDef: CustomColDef[];
  paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, totalPage: 0, sorting: '', skipCount: 0 };
  @Output() changeTabCode: EventEmitter<{ addRegisterNo: string }> = new EventEmitter();
  @Output() autoReloadWhenDisplayTab: EventEmitter<{ reload: boolean, registerNo?: string, reloadTabHasRegisterNo?: string, tabCodes?: string[], key: string }> = new EventEmitter();
  gridParams: GridParams | undefined;
  listContract: GetContractForCreatePoDto[];
  selectedRow;
  selectMultiRows: GetContractForCreatePoDto[];
  countTab: number = 0;


  constructor(
    injector: Injector,
    private formBuilder: FormBuilder,
    private dataFormatService: DataFormatService,
    private purchaseOrdersServiceProxy: PurchaseOrdersServiceProxy,
    private eventBus: EventBusService,
    private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy
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
        headerName: this.l('ContractNo'),
        headerTooltip: this.l('ContractNo'),
        field: 'contractNo',
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
      {
        headerName: this.l('Category'),
        headerTooltip: this.l('Category'),
        field: 'category',
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
        valueFormatter: params => this.dataFormatService.moneyFormat((params.value) ? params.value : 0),
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
        valueFormatter: params => this.dataFormatService.moneyFormat((params.value) ? params.value : 0),
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
      {
        headerName: this.l('Buyer'),
        headerTooltip: this.l('Buyer'),
        field: 'buyer',
        cellClass: ['cell-border'],
        width: 120,
      }
    ];


    this.listSuppliers = [{ value: 0, label: 'Tất cả' }];
    this.listUsers = [{ value: 0, label: 'Tất cả' }];

    this.commonGeneralCacheServiceProxy.getAllSuppliers().subscribe((res) => {
      res.forEach(e => this.listSuppliers.push({ label: (e.supplierNumber + ' - ' + e.supplierName), value: e.id }))
    });

    this.commonGeneralCacheServiceProxy.getAllUsersInfo().subscribe((res) => {
      res.forEach(e => this.listUsers.push({ label: (e.userName + ' - ' + e.name), value: e.id }))
    })
  }

  buildForm() {
    this.autoCreatePurchaseOrdersForm = this.formBuilder.group({
      contractNo: [undefined],
      buyerId: [undefined],
      fromDate: [undefined],
      toDate: [undefined],
      supplierId: [undefined]
    });
    // this.searchPurchasePurpose();
  }

  changePaginationParams(paginationParams: PaginationParamsModel) {
    if (!this.listContract) {
      return;
    }
    this.paginationParams = paginationParams;
    this.paginationParams.skipCount = (paginationParams.pageNum - 1) * paginationParams.pageSize;
    this.paginationParams.pageSize = paginationParams.pageSize;
    this.searchContract();
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

  searchContract() {
    this.spinnerService.show();
    this.purchaseOrdersServiceProxy.getAllContractForCreatePo(
      this.autoCreatePurchaseOrdersForm.get('contractNo').value,
      this.autoCreatePurchaseOrdersForm.get('supplierId').value,
      this.autoCreatePurchaseOrdersForm.get('fromDate').value,
      this.autoCreatePurchaseOrdersForm.get('toDate').value,
      (this.paginationParams ? this.paginationParams.sorting : ''),
      (this.paginationParams ? this.paginationParams.pageSize : 20),
      (this.paginationParams ? this.paginationParams.skipCount : 1))
      .pipe(finalize(() => {
        this.spinnerService.hide();
      }))
      .subscribe((val) => {
        this.listContract = val.items;

        this.gridParams.api.setRowData(this.listContract);
        this.paginationParams.totalCount = val.totalCount;
        this.paginationParams.totalPage = ceil(val.totalCount / this.paginationParams.pageSize);
        // this.gridParams.api.sizeColumnsToFit();
      });
  }

  createManual() {
    this.eventBus.emit({
      type: 'openComponent',
      functionCode: TABS.CREATE_OR_EDIT_PURCHASE_ORDERS,
      tabHeader: this.l('CreateOrEditPurchaseOrder'),
      params: {
        data: {
          countTab: this.countTab.toString(),
          listForCreatePO: this.selectMultiRows,
          typeAutoCreate: AppConsts.CPS_KEYS.TYPE_PC
        }
      }
    });
    this.changeTabCode.emit({ addRegisterNo: this.countTab.toString() });
    this.autoReloadWhenDisplayTab.emit({ reload: true, registerNo: this.countTab.toString(), reloadTabHasRegisterNo: this.countTab.toString(), tabCodes: [TABS.CREATE_OR_EDIT_PURCHASE_REQUEST], key: TABS.PURCHASE_REQUEST })
    this.countTab += 1;

  }

}
