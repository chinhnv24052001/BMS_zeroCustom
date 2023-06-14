import { PermissionCheckerService } from 'abp-ng2-module';
import { AppSessionService } from '@shared/common/session/app-session.service';

import { Injectable } from '@angular/core';
import { AppMenu } from './app-menu';
import { AppMenuItem } from './app-menu-item';
import { TABS } from '@app/shared/constants/tab-keys';

@Injectable()
export class AppNavigationService {
    constructor(
        private _permissionCheckerService: PermissionCheckerService,
        private _appSessionService: AppSessionService
    ) { }

    getMenu(): AppMenu {
        return new AppMenu('MainMenu', 'MainMenu', [
            new AppMenuItem('WorkList', 'WorkList', 'flaticon-dashboard', TABS.MAIN_DASHBOARD),
            new AppMenuItem('ConfigureSystem', 'ConfigureSystem', 'flaticon-interface-8', '', [], [
                new AppMenuItem('ApprovalTree', 'ConfigureSystem.ApprovalTree', 'flaticon-map', TABS.MASTER_APPROVAL_TREE),
                new AppMenuItem('ListOfDocument', 'ConfigureSystem.ListOfDocument', 'flaticon-map', TABS.MASTER_LIST_OF_DOCUMENT),
                new AppMenuItem('InventoryCodeConfig', 'ConfigureSystem.InventoryCodeConfig', 'flaticon-map', TABS.MASTER_INVENTORY_CODE_CONFIG),
            ]),
            new AppMenuItem('MasterData', 'MasterData', 'flaticon-interface-8', '', [], [
                // new AppMenuItem('Master test', '', 'flaticon-map', TABS.MASTER_TEST),
                // new AppMenuItem('MasterPeriod', '', 'flaticon-map', TABS.MASTER_PERIOD),
                new AppMenuItem('PurchasePurpose', 'MasterData.PurchasePurpose', 'flaticon-map', TABS.MASTER_PURCHASE_PURPOSE),
                new AppMenuItem('CurrencyType', 'MasterData.CurrencyType', 'flaticon-map', TABS.MASTER_CURRENCY),
                new AppMenuItem('UnitOfMeasureMenu', 'MasterData.UnitOfMeasure', 'flaticon-map', TABS.MASTER_UNIT_OF_MEASURE),
                // new AppMenuItem('FrameworkContractCatalog', '', 'flaticon-map', TABS.FRAMEWORK_CONTRACT_CATALOG),
                new AppMenuItem('CancelReason', 'MasterData.CancelReason', 'flaticon-map', TABS.MST_CANCEL_REASON),


                //new AppMenuItem('CatalogPiceManagemnt', '', 'flaticon-map', TABS.MASTER_CATALOG_PRICE_MANAGEMENT),
                new AppMenuItem('MasterCatalog', 'MasterData.MasterCatalog', 'flaticon-map', TABS.MASTER_CATALOG),
                // new AppMenuItem('Items and Price Management', '', 'flaticon-map', TABS.MASTER_INVENTORY_ITEM),
                // new AppMenuItem('Product Management', '', 'flaticon-map', TABS.MASTER_INVENTORY_ITEM),

                new AppMenuItem('ProductManagement', 'MasterData.ProductManagement', 'flaticon-map', TABS.MASTER_PRODUCT_INVENTORY_ITEM),
                // new AppMenuItem('Price Management', '', 'flaticon-map', TABS.MASTER_PRICE_INVENTORY_ITEM),
                // new AppMenuItem('Inventory Group', '', 'flaticon-map', TABS.MASTER_INVENTORY_GROUP),
                new AppMenuItem('InventoryGroup', 'MasterData.InventoryGroup', 'flaticon-map', TABS.MASTER_INVENTORY_GROUP_MODAL),
                new AppMenuItem('PersonnelMaster', 'MasterData.PersonnelMaster', 'flaticon-map', TABS.MASTER_HR_ORG_STRUCTURE),

                new AppMenuItem('ExchangeRateData', 'MasterData.MstExchangeRateData', 'flaticon-map', TABS.MASTER_CURRENCY_DATA),
                new AppMenuItem('MasterBudgetCode', 'MasterData.MasterBudgetCode', 'flaticon-map', TABS.MASTER_BUDGET_CODE),
                new AppMenuItem('Project', 'MasterData.Project', 'flaticon-map', TABS.MASTER_PROJECT),
                new AppMenuItem('QuotaExpense', 'MasterData.QuotaExpense', 'flaticon-map', TABS.MASTER_QUOTA_EXPENSE),
                new AppMenuItem('ProductGroup', 'MasterData.ProductGroup', 'flaticon-map', TABS.MASTER_PRODUCT_GROUP),

                new AppMenuItem('Sourcing', '', 'flaticon-map', '', [], [
                    new AppMenuItem('AssessData', '', 'flaticon-map', TABS.MASTER_ASSESS),
                    new AppMenuItem('AssessGroupData', '', 'flaticon-map', TABS.MASTER_ASSESS_GROUP),

                ]),

            ]),
            new AppMenuItem('PriceManagement', 'PriceManagement', 'flaticon-interface-8', '', [], [
                new AppMenuItem('PriceManagement', 'PriceManagement.MstPriceManagement', 'flaticon-map', TABS.MASTER_PRICE_INVENTORY_ITEM),
                new AppMenuItem('FrameworkContractManagement', 'PriceManagement.FrameworkContractManagement', 'flaticon-map', TABS.FRAMEWORK_CONTRACT_MANAGEMENT, [], [], false, { key: 1, prefix: 'MANAGEMENT'}),
                new AppMenuItem('FrameworkContractSupplier', 'PriceManagement.FrameworkContractSupplier', 'flaticon-map', TABS.FRAMEWORK_CONTRACT_MANAGEMENT, [], [], false, { key: 2, prefix: 'SUPPLIER'}),
                new AppMenuItem('FrameworkContractCatalog', 'PriceManagement.FrameworkContractCatalog', 'flaticon-map', TABS.FRAMEWORK_CONTRACT_CATALOG),
            ]),

            new AppMenuItem('SupplierManagement', 'SupplierManagement', 'flaticon-interface-8', '', [], [
                new AppMenuItem('SupplierList', 'SupplierManagement.SupplierList', 'flaticon-map', TABS.MASTER_SUPPLIER),
                new AppMenuItem('SupplierRequest', 'SupplierManagement.SupplierRequest', 'flaticon-map', TABS.MASTER_SUPPLIER_REQUEST),
            ]),

            new AppMenuItem('ApproveRequest', 'ApproveRequest', 'flaticon-interface-8', '', [], [
                //new AppMenuItem('WaitRequest', '', 'flaticon-map', TABS.APPROVE_REQUEST,[], [], false, { key: 1, prefix: 'WAIT' }),
                // new AppMenuItem('Quản lý yêu cầu duyệt', '', 'flaticon-map', TABS.APPROVE_REQUEST,[], [], false, { key: 2, prefix: 'APPROVED' }),
                new AppMenuItem('ApprovalManagement', 'ApproveRequest.ApprovalManagement', 'flaticon-map', TABS.APPROVE_REQUEST),
            ]),

            new AppMenuItem('UserRequest', 'UserRequest', 'flaticon-interface-8', '', [], [
                new AppMenuItem('BuyRequestFromCatalog', 'UserRequest.BuyRequestFromCatalog', 'flaticon-map', TABS.UR_BUY_REQUEST_FROM_CATALOG),
                new AppMenuItem('ManageUserRequest', 'UserRequest.ManageUserRequest', 'flaticon-map', TABS.UR_REQUEST),
            ]),

            new AppMenuItem('PurchaseRequest', 'PurchaseRequest', 'flaticon-interface-8', '', [], [
                new AppMenuItem('PurchaseRequestManagement', 'PurchaseRequest.PurchaseRequestManagement', 'flaticon-map', TABS.PURCHASE_REQUEST, [], [], false, { key: 1, prefix: 'MANAGEMENT' }),
                // new AppMenuItem('PurchaseRequestHandle', 'PurchaseRequest.PurchaseRequestHandle', 'flaticon-map', TABS.PURCHASE_REQUEST, [], [], false, { key: 2, prefix: 'HANDLE' }),
                new AppMenuItem('CreatePurchaseRequest', 'PurchaseRequest.CreatePurchaseRequest', 'flaticon-map', TABS.UR_AUTO_CREATE_PR),
            ]),

            new AppMenuItem('PurchaseOrders', 'PurchaseOrders', 'flaticon-interface-8', '', [], [
                // new AppMenuItem('PurchaseOrders', '', 'flaticon-map', TABS.PURCHASE_ORDERS),
                new AppMenuItem('PurchaseOrdersManagement', 'PurchaseOrders.PurchaseOrdersManagement', 'flaticon-map', TABS.PURCHASE_ORDERS, [], [], false, { key: 1, prefix: 'MANAGEMENT' }),
                // new AppMenuItem('PurchaseOrdersHandle', 'PurchaseOrders.PurchaseOrdersHandle', 'flaticon-map', TABS.PURCHASE_ORDERS, [], [], false, { key: 2, prefix: 'HANDLE' }),
                new AppMenuItem('AutoCreatePurchaseOrders', 'PurchaseOrders.AutoCreatePurchaseOrders', 'flaticon-map', TABS.AUTO_CREATE_PURCHASE_ORDERS),
                // new AppMenuItem('AutoCreatePurchaseOrdersFromContract', 'PurchaseOrders.PurchaseOrdersManagement', 'flaticon-map', TABS.AUTO_CREATE_PURCHASE_ORDERS_FROM_CONTRACT),
            ]),

            new AppMenuItem('SupplierPurchaseOrders', 'SupplierPurchaseOrders', 'flaticon-interface-8', '', [], [
                new AppMenuItem('PurchaseOrdersHandle', 'SupplierPurchaseOrders.PurchaseOrdersHandle', 'flaticon-map', TABS.PURCHASE_ORDERS, [], [], false, { key: 2, prefix: 'HANDLE' }),
            ]),

            new AppMenuItem('InvoiceItems', 'InvoiceItems', 'flaticon-interface-8', '', [], [
                new AppMenuItem('PaymentRequest', 'InvoiceItems.PaymentRequest', 'flaticon-map', TABS.PAYMENT_REQUEST),
                new AppMenuItem('Invoices', 'InvoiceItems.Invoices', 'flaticon-map', TABS.INVOICE),
                new AppMenuItem('InvoiceAdjusted', 'InvoiceItems.InvoiceAdjusted', 'flaticon-map', TABS.INVOCIE_ADJUSTED),
                // new AppMenuItem('DigitalInvoices', 'InvoiceItems.DigitalInvoices', 'flaticon-map', TABS.DIGITAL_INVOICE),
                new AppMenuItem('Prepayment', 'InvoiceItems.Prepayment', 'flaticon-map', TABS.PAYMENT_ADVANCE),
                new AppMenuItem('PaymentRequestFromSuppliers', 'InvoiceItems.PaymentRequestFromSuppliers', 'flaticon-map', TABS.PAYMENT_REQUEST_FROM_SUPPLIERS),
            ]),

            new AppMenuItem('GoodsReceipt', 'GoodsReceipt', 'flaticon-interface-8', '', [], [
                new AppMenuItem('ReceiptNotes', 'GoodsReceipt.ReceiptNotes', 'flaticon-map', TABS.RECEIPT_NOTES, [], [], false,{ key: 0 , prefix : 'RECEIPT' }),
                new AppMenuItem('AcceptanceNotes', 'GoodsReceipt.AcceptanceNotes', 'flaticon-map', TABS.RECEIPT_NOTES, [], [], false, { key: 1 , prefix : 'ACCEPT' }),
                new AppMenuItem('GoodsReceipts', 'GoodsReceipt.GoodsReceipts', 'flaticon-map', TABS.GOODS_RECEIPT, [], [], false,{ key: 0 , prefix : 'RECEIPT' }),
                new AppMenuItem('ServiceReceipts', 'GoodsReceipt.ServiceReceipts', 'flaticon-map', TABS.GOODS_RECEIPT,[], [], false, { key: 1 , prefix : 'ACCEPT' }),

                //new AppMenuItem('GRFromReceiptNotes','','flaticon-map',TABS.CREATE_OR_EDIT_GR_FROM_RECEIPT_NOTES),
                //new AppMenuItem('ReturnGoodsReceipt', 'GoodsReceipt.ReturnGoodsReceipt', 'flaticon-map', TABS.RETURN_GOODS_RECEIPT),
                new AppMenuItem('ReturnGoodsReceipt', 'GoodsReceipt.ReturnGoodsReceipt', 'flaticon-map', TABS.RETURN_GOODS_RECEIPT_LIST),
            ]),
            new AppMenuItem('Sourcing', '', 'flaticon-interface-8', '', [], [
                new AppMenuItem('SourcingList', '', 'flaticon-map', TABS.SOURCING_LIST),
            ]),

            new AppMenuItem('BMS', '', 'flaticon-interface-8', '', [], [
                new AppMenuItem('BudgetControlSetup', 'BudgetControlSetup', 'flaticon-map', TABS.BMS_USER_BUDGET_CONTROL), 
                new AppMenuItem('Master Data', 'MasterBmsData', 'flaticon-interface-8', '', [], [
                    new AppMenuItem('SegmentStructure', 'MasterBmsData.SegmentStructure', 'flaticon-interface-8', '', [], [
                        new AppMenuItem('Segment1', '', 'flaticon-interface-8', '', [], [
                            new AppMenuItem('Segment1', '', 'flaticon-map', TABS.BMS_MST_SEGMENT1), 
                            new AppMenuItem('Segment1TypeCost', '', 'flaticon-map', TABS.BMS_MST_SEGMENT1_TYPE_COST),  
                        ]),
                        new AppMenuItem('Segment2', '', 'flaticon-interface-8', '', [], [
                            new AppMenuItem('Segment2', '', 'flaticon-map', TABS.BMS_MST_SEGMENT2),
                            new AppMenuItem('Segment2ProjectType', '', 'flaticon-map', TABS.BMS_MST_SEGMENT2_PROJECT_TYPE), 
                        ]),
                        new AppMenuItem('Segment3', '', 'flaticon-map', TABS.BMS_MST_SEGMENT3),
                        new AppMenuItem('Segment4', '', 'flaticon-interface-8', '', [], [
                            new AppMenuItem('Segment4', '', 'flaticon-map', TABS.BMS_MST_SEGMENT4),
                            new AppMenuItem('Segment4Group', '', 'flaticon-map', TABS.BMS_MST_SEGMENT4_GROUP), 
                        ]),
                        new AppMenuItem('Segment5', '', 'flaticon-map', TABS.BMS_MST_SEGMENT5), 
                    ]),
                    new AppMenuItem('BudgetPlan', 'MasterBmsData.BudgetPlan', 'flaticon-map', TABS.BMS_MST_PAIRING_SEGMENT), 
                    new AppMenuItem('BudgetPlanVersion', 'MasterBmsData.BudgetPlanVersion', 'flaticon-map', TABS.BMS_MST_PERIOD), 
                    new AppMenuItem('ProjectCode12', 'MasterBmsData.ProjectCode12', 'flaticon-map', TABS.BMS_MST_PROJECT_CODE),
                    new AppMenuItem('OtherInvestment', 'MasterBmsData.OtherInvestment', 'flaticon-map', ''), 
                    new AppMenuItem('ExchangeRate', 'MasterBmsData.ExchangeRate', 'flaticon-map', TABS.BMS_MST_EXCHANGE_RATE), 
                ]),

                new AppMenuItem('BudgetPIC', 'BudgetPIC', 'flaticon-interface-8', '', [], [
                    // new AppMenuItem('122', '', 'flaticon-map', TABS.BMS_BUDGET_TRANSFER), 
                    new AppMenuItem('BudgetReviewMenuUser', '', 'flaticon-map', TABS.BMS_BUDGET_REVIEW, [], [], false, { key: 1, prefix: 'BUDGET_PIC' }),
                    new AppMenuItem('BudgetPlanReviewMenuUser', '', 'flaticon-map', TABS.BMS_BUDGET_PLAN_REVIEW, [], [], false, { key: 1, prefix: 'BUDGET_PIC' }),
                    new AppMenuItem('BudgetPlanReviewMenuGroup', '', 'flaticon-map', TABS.BMS_BUDGET_PLAN_REVIEW, [], [], false, { key: 2, prefix: 'DIVISION_HEAD' }),
                    new AppMenuItem('BudgetAddNew_TransferMenuBudgetPIC', '', 'flaticon-map', TABS.BMS_BUDGET_TRANSFER, [], [], false, { key: 1, prefix: 'BUDGET_PIC' }),
                ]),

                new AppMenuItem('DivisionHead', 'DivisionHead', 'flaticon-interface-8', '', [], [
                    new AppMenuItem('BudgetReviewMenuGroup', '', 'flaticon-map', TABS.BMS_BUDGET_REVIEW, [], [], false, { key: 2, prefix: 'DIVISION_HEAD' }),
                    new AppMenuItem('BudgetAddNew_TransferMenuDivisionHead', '', 'flaticon-map', TABS.BMS_BUDGET_TRANSFER, [], [], false, { key: 2, prefix: 'DIVISION_HEAD' }),
                ]),

                new AppMenuItem('Finance', 'Finance', 'flaticon-interface-8', '', [], [
                    new AppMenuItem('BudgetReviewMenuFinance', '', 'flaticon-map', TABS.BMS_BUDGET_REVIEW, [], [], false, { key: 3, prefix: 'FINANCE' }),
                    new AppMenuItem('BudgetPlanReviewMenuFin', '', 'flaticon-map', TABS.BMS_BUDGET_PLAN_REVIEW, [], [], false, { key: 3, prefix: 'FINANCE' }),
                    new AppMenuItem('BudgetAddNew_TransferMenuFinance', '', 'flaticon-map', TABS.BMS_BUDGET_TRANSFER, [], [], false, { key: 3, prefix: 'FINANCE' }),
                ]),
            ]),

            // new AppMenuItem('Dashboard', 'Pages.Tenant.Dashboard', 'flaticon-line-graph', '/app/main/dashboard'),
            new AppMenuItem('Tenants', 'Pages.Tenants', 'flaticon-list-3', '/app/admin/tenants'),
            new AppMenuItem('Editions', 'Pages.Editions', 'flaticon-app', '/app/admin/editions'),
            // new AppMenuItem('Dashboard', 'Pages.Administration.Host.Dashboard', 'flaticon-line-graph', '/app/admin/hostDashboard'),
            new AppMenuItem('Dashboard', 'Pages.Tenant.Dashboard', 'flaticon-line-graph', '/app/main/dashboard'),
            new AppMenuItem('Tenants', 'Pages.Tenants', 'flaticon-list-3', '/app/admin/tenants'),
            new AppMenuItem('Editions', 'Pages.Editions', 'flaticon-app', '/app/admin/editions'),
            new AppMenuItem('Administration', '', 'flaticon-interface-8', '', [], [
                new AppMenuItem('OrganizationUnits', 'Pages.Administration.OrganizationUnits', 'flaticon-map', '/app/admin/organization-units'),
                new AppMenuItem('Roles', 'Pages.Administration.Roles', 'flaticon-suitcase', '/app/admin/roles'),
                new AppMenuItem('Users', 'Pages.Administration.Users', 'flaticon-users', '/app/admin/users'),
                new AppMenuItem('Languages', 'Pages.Administration.Languages', 'flaticon-tabs', '/app/admin/languages', ['/app/admin/languages/{name}/texts']),
                new AppMenuItem('AuditLogs', 'Pages.Administration.AuditLogs', 'flaticon-folder-1', '/app/admin/auditLogs'),
                new AppMenuItem('Maintenance', 'Pages.Administration.Host.Maintenance', 'flaticon-lock', '/app/admin/maintenance'),
                new AppMenuItem('Subscription', 'Pages.Administration.Tenant.SubscriptionManagement', 'flaticon-refresh', '/app/admin/subscription-management'),
                new AppMenuItem('VisualSettings', 'Pages.Administration.UiCustomization', 'flaticon-medical', '/app/admin/ui-customization'),
                new AppMenuItem('WebhookSubscriptions', 'Pages.Administration.WebhookSubscription', 'flaticon2-world', '/app/admin/webhook-subscriptions'),
                new AppMenuItem('DynamicProperties', 'Pages.Administration.DynamicProperties', 'flaticon-interface-8', '/app/admin/dynamic-property'),
                new AppMenuItem('Settings', 'Pages.Administration.Host.Settings', 'flaticon-settings', '/app/admin/hostSettings'),
                new AppMenuItem('Settings', 'Pages.Administration.Tenant.Settings', 'flaticon-settings', '/app/admin/tenantSettings')
            ]),
            new AppMenuItem('DemoUiComponents', 'Pages.DemoUiComponents', 'flaticon-shapes', '/app/admin/demo-ui-components')
        ]);
    }



    checkChildMenuItemPermission(menuItem): boolean {
        for (let i = 0; i < menuItem.items.length; i++) {
            let subMenuItem = menuItem.items[i];

            if (subMenuItem.permissionName === '' || subMenuItem.permissionName === null) {
                if (subMenuItem.route) {
                    return true;
                }
            } else if (this._permissionCheckerService.isGranted(subMenuItem.permissionName)) {
                return true;
            }

            if (subMenuItem.items && subMenuItem.items.length) {
                let isAnyChildItemActive = this.checkChildMenuItemPermission(subMenuItem);
                if (isAnyChildItemActive) {
                    return true;
                }
            }
        }
        return false;
    }

    showMenuItem(menuItem: AppMenuItem): boolean {
        if (
            menuItem.permissionName === 'Pages.Administration.Tenant.SubscriptionManagement' &&
            this._appSessionService.tenant &&
            !this._appSessionService.tenant.edition
        ) {
            return false;
        }

        let hideMenuItem = false;

        if (menuItem.requiresAuthentication && !this._appSessionService.user) {
            hideMenuItem = true;
        }

        if (menuItem.permissionName && !this._permissionCheckerService.isGranted(menuItem.permissionName)) {
            hideMenuItem = true;
        }

        if (this._appSessionService.tenant || !abp.multiTenancy.ignoreFeatureCheckForHostUsers) {
            if (menuItem.hasFeatureDependency() && !menuItem.featureDependencySatisfied()) {
                hideMenuItem = true;
            }
        }

        if (!hideMenuItem && menuItem.items && menuItem.items.length) {
            return this.checkChildMenuItemPermission(menuItem);
        }

        return !hideMenuItem;
    }

    /**
     * Returns all menu items recursively
     */
    getAllMenuItems(): AppMenuItem[] {
        let menu = this.getMenu();
        let allMenuItems: AppMenuItem[] = [];
        menu.items.forEach((menuItem) => {
            allMenuItems = allMenuItems.concat(this.getAllMenuItemsRecursive(menuItem));
        });

        return allMenuItems;
    }

    private getAllMenuItemsRecursive(menuItem: AppMenuItem): AppMenuItem[] {
        if (!menuItem.items) {
            return [menuItem];
        }

        let menuItems = [menuItem];
        menuItem.items.forEach((subMenu) => {
            menuItems = menuItems.concat(this.getAllMenuItemsRecursive(subMenu));
        });

        return menuItems;
    }
}
