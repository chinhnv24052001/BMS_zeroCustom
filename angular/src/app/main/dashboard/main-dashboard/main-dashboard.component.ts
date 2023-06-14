import { EventBusService } from '@app/shared/services/event-bus.service';
import { ICellRendererParams, ValueFormatterParams } from '@ag-grid-enterprise/all-modules';
import { Component, Injector, ViewChild } from '@angular/core';
import { TABS } from '@app/shared/constants/tab-keys';
import { CustomColDef, GridParams } from '@app/shared/models/base.model';
import { DataFormatService } from '@app/shared/services/data-format.service';
import { AppComponentBase } from '@shared/common/app-component-base';
import { MainDashboardActionsForViewDto, PcsMainDashboardServiceProxy } from '@shared/service-proxies/service-proxies';
import { finalize } from 'rxjs/operators';
import { AppConsts } from '@shared/AppConsts';
import { ModalDirective } from 'ngx-bootstrap/modal';

@Component({
    selector: 'main-dashboard',
    templateUrl: './main-dashboard.component.html',
    styleUrls: ['./main-dashboard.component.less']
})
export class MainDashboardComponent extends AppComponentBase {
    @ViewChild('dashboardConfigModal', { static: true }) dashboardConfigModal!: ModalDirective;

    dashboardColDef: CustomColDef[] = [];
    defaultColDef: CustomColDef = {
        filter: false,
        sortable: false,
        suppressMenu: true,
        menuTabs: [],
        floatingFilter: true
    };
    actions: MainDashboardActionsForViewDto[] = [];
    actionParams: GridParams;
    selectedAction: MainDashboardActionsForViewDto = new MainDashboardActionsForViewDto();

    constructor(
        injector: Injector,
        private _serviceProxy: PcsMainDashboardServiceProxy,
        private _dataFormatService: DataFormatService,
        private eventBus: EventBusService,
    ) {
        super(injector);
        this.dashboardColDef = [
            {
                // STT
                headerName: this.l('STT'),
                headerTooltip: this.l('STT'),
                cellRenderer: (params: ICellRendererParams) => (params.rowIndex + 1).toString(),
                width: 50,
                cellClass: ['text-center']
            },
            {
                headerName: this.l('RequestUser'),
                headerTooltip: this.l('From'),
                cellClass: ['text-left'],
                field: 'requester',
                width: 120,
            },
            {
                headerName: this.l('ProcessType'),
                headerTooltip: this.l('Type'),
                cellClass: ['text-left'],
                field: 'type',
                width: 120,
            },
            {
                headerName: this.l('Subject'),
                headerTooltip: this.l('Subject'),
                cellClass: ['text-left'],
                field: 'subject',
                width: 250,
            },
            {
                headerName: this.l('SendDate'),
                headerTooltip: this.l('Sent'),
                cellClass: ['text-center'],
                field: 'requestDate',
                valueFormatter: (params: ValueFormatterParams) => _dataFormatService.dateFormat(params.value),
                width: 120,
            },
            {
                headerName: this.l('Status'),
                headerTooltip: this.l('Status'),
                cellClass: ['text-center'],
                field: 'approvalStatus',
                cellStyle: (params) => params.data?.approvalStatus == 'REJECTED' ? { 'background-color': '#ff7f7f'}
                    : params.data?.approvalStatus == 'APPROVED' ? { 'background-color': '#9ce973'}
                    : params.data?.approvalStatus == 'WAITTING' ? { 'background-color': '#ffffb2'}
                    : params.data?.approvalStatus == 'FORWARD' ? { 'background-color': '#3dd7ff'}
                    : {},
                width: 120,
            }
        ]
    }

    ngOnInit() {
        this.getAllActions();
    }

    getAllActions() {
        this.actions = [];
        this.spinnerService.show();
        this._serviceProxy.getAllDashboardActionForView()
            .pipe(finalize(() => this.spinnerService.hide()))
            .subscribe(res => this.actions = res)
    }

    callBackActionGrid(params: GridParams) {
        this.actionParams = params;
    }

    onChangeActionSelection(params: GridParams) {
        this.selectedAction = params.api?.getSelectedRows()[0] ?? new MainDashboardActionsForViewDto();
    }

    open(params: number) {
        let tabs = '';
        switch (params) {
            case 0:
                tabs = TABS.UR_BUY_REQUEST_FROM_CATALOG;
                this.eventBus.emit({
                    type: 'openComponent',
                    functionCode: tabs,
                    tabHeader: this.l('BuyRequestFromCatalog'),
                });
                break;
            case 1:
                tabs = TABS.UR_CREATE_USER_REQUEST;
                this.eventBus.emit({
                    type: 'openComponent',
                    functionCode: tabs,
                    tabHeader: this.l('UserRequest'),
                });
                break;
            case 2:
                tabs = TABS.CREATE_OR_EDIT_PURCHASE_REQUEST;
                this.eventBus.emit({
                    type: 'openComponent',
                    functionCode: tabs,
                    tabHeader: this.l('CreateOrEditPurchaseRequest'),
                    params: {
                        data: {
                            countTab: '0',
                            purchaseRequestId: 0
                        }
                    }
                });
                break;
            case 3:
                tabs = TABS.CREATE_OR_EDIT_PURCHASE_ORDERS;
                this.eventBus.emit({
                    type: 'openComponent',
                    functionCode: tabs,
                    tabHeader: this.l('CreateOrEditPurchaseOrder'),
                    params: {
                        data: {
                            countTab: '0',
                            purchaseOrderId: 0
                        }
                    }
                });
                break;
            case 4:
                tabs = TABS.APPROVE_REQUEST;
                this.eventBus.emit({
                    type: 'openComponent',
                    functionCode: tabs,
                    tabHeader: this.l('ApprovalManagement'),
                });
                break;
        }
    }

    viewDetail() {
        if (this.selectedAction.id && this.selectedAction.id > 0) {
            if (this.selectedAction.type == 'User Request') {
                this.eventBus.emit({
                    type: 'openComponent',
                    functionCode: TABS.UR_REQUEST,
                    tabHeader: this.l('UserRequest'),
                    params: {
                        data: {
                            userRequest: this.selectedAction.subject
                        }
                    }
                });
            }
            else if (this.selectedAction.type == 'Purchase Request') {
                this.eventBus.emit({
                    type: 'openComponent',
                    functionCode: TABS.PURCHASE_REQUEST,
                    tabHeader: this.l('PurchaseRequest'),
                    params: {
                        data: {
                            purchaseRequest: this.selectedAction.requisitionNo
                        }
                    }
                });
            }
            else if (this.selectedAction.type == 'Purchase Order') {
                this.eventBus.emit({
                    type: 'openComponent',
                    functionCode: TABS.PURCHASE_ORDERS,
                    tabHeader: this.l('PurchaseOrder'),
                    params: {
                        data: {
                            purchaseOrder: this.selectedAction.requisitionNo
                        }
                    }
                });
            }
            else {

            }
        } else {
            this.notify.warn(this.l(AppConsts.CPS_KEYS.Please_Select_1_Line))
        }
    }

    openApprove() {
        this.eventBus.emit({
            type: 'openComponent',
            functionCode: TABS.APPROVE_REQUEST,
            tabHeader: this.l('ApprovalManagement'),
            params: {
                data: {
                    requisitionNo: this.selectedAction.requisitionNo
                }
            }
        });
    }
}
