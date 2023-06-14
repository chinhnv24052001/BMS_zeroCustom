import { GridParams } from '@ag-grid-enterprise/all-modules';
import { CustomColDef } from '@app/shared/models/base.model';
import { finalize } from 'rxjs/operators';
import { CommonGeneralCacheServiceProxy, GetAllUserRequestForPrDto, PurchaseOrdersServiceProxy, PurchaseRequestServiceProxy, UrUserRequestManagementServiceProxy } from './../../../../shared/service-proxies/service-proxies';
import { AppComponentBase } from '@shared/common/app-component-base';
import { Component, EventEmitter, Injector, Output } from '@angular/core';
import { PaginationParamsModel } from '@app/shared/models/base.model';
import { ceil, groupBy } from 'lodash';
import { AgCheckboxRendererComponent } from '@app/shared/common/grid-input-types/ag-checkbox-renderer/ag-checkbox-renderer.component';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { EventBusService } from '@app/shared/services/event-bus.service';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppConsts } from '@shared/AppConsts';

@Component({
    selector: 'auto-create-pr',
    templateUrl: './auto-create-pr.component.html',
    styleUrls: ['./auto-create-pr.component.less']
})
export class AutoCreatePrComponent extends AppComponentBase {

    @Output() changeTabCode: EventEmitter<{ addRegisterNo: string }> = new EventEmitter();
    @Output() autoReloadWhenDisplayTab: EventEmitter<{ reload: boolean, registerNo?: string, reloadTabHasRegisterNo?: string, tabCodes?: string[], key: string }> = new EventEmitter();
    paginationParams: PaginationParamsModel = { pageNum: 1, pageSize: 20, totalCount: 0, skipCount: 0, sorting: '', totalPage: 0 };
    urColDefs: CustomColDef[] = [];
    listUsers: { label: string, value: string | number }[] = [];
    listSuppliers: { label: string, value: string | number }[] = [];
    defaultColDef: CustomColDef;
    urParams: GridParams;

    userRequestNumber: string = '';
    preparerId: number | undefined;
    buyerId: number | undefined;
    supplierId: number | undefined;
    supplierSiteId: number | undefined;
    documentTypeId: number | undefined;
    fromDate: any;
    toDate: any;
    frameworkComponents: any;
    countTab: number = 0;

    userRequests: GetAllUserRequestForPrDto[] = [];
    selectedUserRequests: GetAllUserRequestForPrDto[] = [];
    constructor(
        injector: Injector,
        private _serviceProxy: UrUserRequestManagementServiceProxy,
        private purchaseRequestServiceProxy: PurchaseRequestServiceProxy,
        private purchaseOrdersServiceProxy: PurchaseOrdersServiceProxy,
        private dataFormatService: DataFormatService,
        private eventBus: EventBusService,
        private commonGeneralCacheServiceProxy: CommonGeneralCacheServiceProxy,
    ) {
        super(injector);
        this.frameworkComponents = {
            agCheckboxRendererComponent: AgCheckboxRendererComponent
        };
        this.urColDefs = [
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
                headerName: this.l('No.'),
                headerTooltip: this.l('No.'),
                cellRenderer: (params) => params.rowIndex + 1 + ((this.paginationParams.pageNum ?? 1) - 1) * (this.paginationParams.pageSize ?? 20),
                cellClass: ['text-center'],
                width: 60
            },
            {
                headerName: this.l('RequisitionNo'),
                headerTooltip: this.l('RequisitionNo'),
                field: 'requisitionNo',
                cellClass: ['cell-border'],
                width: 100
            },
            // {
            //     headerName: this.l('InventoryGroup'),
            //     headerTooltip: this.l('InventoryGroup'),
            //     field: 'userRequestName',
            //     cellClass: ['cell-border'],
            //     width: 150,
            // },
            {
                headerName: this.l('InventoryGroup'),
                headerTooltip: this.l('InventoryGroup'),
                field: 'productGroupName',
                cellClass: ['cell-border'],
                width: 100,
            },
            {
                headerName: this.l('ProductCode'),
                headerTooltip: this.l('ProductCode'),
                field: 'partNo',
                cellClass: ['cell-border'],
                width: 100,
            },
            {
                headerName: this.l('ProductName'),
                headerTooltip: this.l('ProductName'),
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
                field: 'uom',
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
                headerName: this.l('DeliveryDate'),
                headerTooltip: this.l('DeliveryDate'),
                field: 'needByDate',
                valueGetter: params => this.dataFormatService.dateFormat(params.data.needByDate),
                cellClass: ['cell-border'],
                width: 130,
                cellRenderer: 'agDatepickerRendererComponent'
            },
            {
                headerName: this.l('TotalPrice'),
                headerTooltip: this.l('TotalPrice'),
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
                field: 'buyer',
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
            //     headerName: this.l('Buyer'),
            //     headerTooltip: this.l('Buyer'),
            //     field: 'buyer',
            //     cellClass: ['cell-border'],
            //     width: 120,
            // }
        ]
        
        this.listSuppliers = [{ value: 0, label: 'Tất cả' }];
        this.listUsers = [{ value: 0, label: 'Tất cả' }];
    
        this.commonGeneralCacheServiceProxy.getAllSuppliers().subscribe((res) => {
          res.forEach(e => this.listSuppliers.push({ label: (e.supplierNumber + ' - ' + e.supplierName), value: e.id }))
        });
    
        this.commonGeneralCacheServiceProxy.getAllUsersInfo().subscribe((res) => {
          res.forEach(e => this.listUsers.push({ label: (e.userName + ' - ' + e.name), value: e.id }))
        })
    }

    ngOnInit() {
        this.search();
    }

    search() {
        this.getAllUserRequest();
    }

    getAllUserRequest() {
        this.spinnerService.show();
        this._serviceProxy.getAllUserRequestForPr(
            this.userRequestNumber ?? '',
            this.preparerId ?? undefined,
            this.buyerId ?? undefined,
            this.supplierId ?? undefined,
            this.supplierSiteId ?? undefined,
            this.documentTypeId ?? undefined,
            this.fromDate ?? undefined,
            this.toDate ?? undefined,
            this.paginationParams ? this.paginationParams.sorting : '',
            this.paginationParams ? this.paginationParams.pageSize : 20,
            this.paginationParams ? this.paginationParams.skipCount : 0
        )
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => {
                this.userRequests = res.items ?? [];
                this.paginationParams.totalCount = res.totalCount ?? 0;
                this.paginationParams.totalPage = ceil(
                    res.totalCount / (this.paginationParams.pageSize ?? 0)
                );
            })
    }

    callBackUserRequestGrid(params: GridParams) {
        this.urParams = params
    }

    onChangeUserRequestSelection(params: any) {
        this.selectedUserRequests = params.api?.getSelectedRows();
    }

    changePaginationParams(paginationParams: PaginationParamsModel) {
        this.paginationParams = paginationParams;
        this.paginationParams.pageNum = paginationParams.pageNum;
        this.paginationParams.skipCount =
            ((paginationParams.pageNum ?? 1) - 1) * (paginationParams.pageSize ?? 20);
        this.paginationParams.pageSize = paginationParams.pageSize;

        this.getAllUserRequest();
    }

    createPR() {
        if (this.selectedUserRequests && this.selectedUserRequests.length > 0) {
            var groupedInventoryGroups = groupBy(this.selectedUserRequests, ur => ur.inventoryGroupId);
            if (Object.keys(groupedInventoryGroups).length === 1) {
                this.spinnerService.show();
                this.purchaseRequestServiceProxy.createPrFromUr(this.selectedUserRequests)
                    .pipe(finalize(() => {
                        
                        this.getAllUserRequest();
                        this.spinnerService.hide();
                    }))
                    .subscribe((res) => {
                        this.notify.success(this.l('SuccessfullyCreatedPr', res.length));
                        res.forEach(e => {
                            this.eventBus.emit({
                                type: 'openComponent',
                                functionCode: TABS.CREATE_OR_EDIT_PURCHASE_REQUEST,
                                tabHeader: this.l('CreateOrEditPurchaseRequest'),
                                params: {
                                    data: {
                                        countTab: e.prNumber,
                                        purchaseRequestId: e.id
                                    }
                                }
                            });
                            this.changeTabCode.emit({ addRegisterNo: e.prNumber });
                            this.autoReloadWhenDisplayTab.emit({ reload: true, registerNo: e.prNumber, reloadTabHasRegisterNo: e.prNumber, tabCodes: [TABS.CREATE_OR_EDIT_PURCHASE_REQUEST], key: TABS.PURCHASE_REQUEST })
                        });
                    });
            }
            else {
                this.notify.warn(this.l('InventorygroupDouble'));
            }
        } else {
            this.notify.warn(this.l('SelectLine'));
        }

    }

    createPO() {
        if (this.selectedUserRequests && this.selectedUserRequests.length > 0) {
            var groupedInventoryGroups = groupBy(this.selectedUserRequests, ur => ur.inventoryGroupId);
            if (Object.keys(groupedInventoryGroups).length === 1) {
                this.spinnerService.show();
                this.purchaseOrdersServiceProxy.createPoFromUr(this.selectedUserRequests)
                .pipe(finalize(() => {
                    this.spinnerService.hide();
                }))
                .subscribe((res) => {
                    this.notify.success(this.l('SuccessfullyCreatedPo', res.length));
                    this.getAllUserRequest();
                    res.forEach(e => {
                        this.eventBus.emit({
                            type: 'openComponent',
                            functionCode: TABS.CREATE_OR_EDIT_PURCHASE_ORDERS,
                            tabHeader: this.l('CreateOrEditPurchaseOrder'),
                            params: {
                              data: {
                                countTab: e.poNumber,
                                purchaseOrderId: e.id
                              }
                            }
                        });
                        this.changeTabCode.emit({ addRegisterNo: e.poNumber });
                        this.autoReloadWhenDisplayTab.emit({ reload: true, registerNo: e.poNumber, reloadTabHasRegisterNo: e.poNumber, tabCodes: [TABS.CREATE_OR_EDIT_PURCHASE_ORDERS], key: TABS.PURCHASE_ORDERS })
                    });
                });

                // let listId = '';
                // this.selectedUserRequests.forEach(e => {
                //     listId = listId + ',' + e.id;
                // });
                // this.eventBus.emit({
                //     type: 'openComponent',
                //     functionCode: TABS.CREATE_OR_EDIT_PURCHASE_ORDERS,
                //     tabHeader: this.l('CreateOrEditPurchaseOrder'),
                //     params: {
                //         data: {
                //             countTab: listId.toString(),
                //             listForCreatePO: this.selectedUserRequests,
                //             typeAutoCreate: AppConsts.CPS_KEYS.TYPE_UR
                //         }
                //     }
                // });
                // this.changeTabCode.emit({ addRegisterNo: listId.toString() });
                // this.autoReloadWhenDisplayTab.emit({ reload: true, registerNo: listId.toString(), reloadTabHasRegisterNo: listId.toString(), tabCodes: [TABS.CREATE_OR_EDIT_PURCHASE_REQUEST], key: TABS.PURCHASE_REQUEST })
                // this.countTab += 1;
            }
            else {
                this.notify.warn(this.l('InventorygroupDouble'));
            }
        } else {
            this.notify.warn(this.l('SelectLine'));
        }
    }
}
