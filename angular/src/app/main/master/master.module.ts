import { CreateOrEditCatalogModalComponent } from './mst-catalog/create-or-edit-catalog-modal/create-or-edit-catalog-modal.component';
import { MstCatalogComponent } from './mst-catalog/mst-catalog.component';
import { BudgetCodeComponent } from './budget-code/budget-code.component';
import { MstCurrencyDataComponent } from './mst-currency-data/mst-currency-data.component';
import { AddSupplierModule } from '../../../account/register/add-supplier/add-supplier.module';
import { AddSupplierRoutingModule } from '../../../account/register/add-supplier/add-supplier.routing.module';
import { CreateRequestModalComponent } from './mst-supplier-request/create-request-modal/create-request-modal.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MasterTestComponent } from './master-test/master-test.component';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { MstPeriodComponent } from './mst-period/mst-period.component';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { CreateOrEditMstPeriodComponent } from './mst-period/create-or-edit-mst-period/create-or-edit-mst-period.component';
import { MstPurchasePurposeComponent } from './mst-purchase-purpose/mst-purchase-purpose.component';
import { CreateOrEditMstPurchasePurposeComponent } from './mst-purchase-purpose/create-or-edit-mst-purchase-purpose/create-or-edit-mst-purchase-purpose.component';
import { CreateOrEditMstInventoryItemComponent } from './mst-inventory-item/create-edit-mst-inventory-item/create-or-edit-mst-inventory-item.component';
import { MstCurrencyComponent } from './mst-currency/mst-currency.component';
import { MstUnitOfMeasureComponent } from './mst-unit-of-measure/mst-mst-unit-of-measure.component';
import { CreateOrEditMstUnitOfMeasureComponent } from './mst-unit-of-measure/create-or-edit-mst-mst-unit-of-measure/create-or-edit-mst-unit-of-measure.component';
import { MstContactComponent } from './mst-supplier/mst-supplier-contact/mst-supplier-contact.component';
import { MstSupplierSiteComponent } from './mst-supplier/mst-supplier-site/mst-supplier-site.component';
import { MstSupplierComponent } from './mst-supplier/mst-supplier.component';
import { CreateOrResetMstSupplierContactComponent } from './mst-supplier/mst-supplier-contact/create-or-reset-mst-supplier-contact/create-or-reset-mst-supplier-contact.component';
import { MstInventoryItemComponent } from './mst-inventory-item/mst-inventory-item.component';
import { ApprovalTreeComponent } from './approval-tree/approval-tree.component';
import { CreateOrEditApprovalTreeComponent } from './approval-tree/create-or-edit-approval-tree/create-or-edit-approval-tree.component';
import { CreateOrEditApprovalTreeDetailComponent } from './approval-tree/create-or-edit-approval-tree/create-or-edit-approval-tree-detail/create-or-edit-approval-tree-detail.component';

import { MstHrOrgComponent } from './mst-hr-org/mst-hr-org.component';
import { MstPersonnelComponent } from './mst-hr-org/mst-personnel/mst-personnel.component';
import { MstInventoryGroupComponent } from './mst-inventory-group/mst-inventory-group.component';
import { CreateOrEditMstInventoryGroupComponent } from './mst-inventory-group/create-oredit-mst-inventory-group/create-or-edit-mst-inventory-group.component';
import { CreateOrEditMstInventoryItemPricesComponent } from './mst-inventory-item/create-edit-mst-inventory-item-prices/create-edit-mst-inventory-item-prices.component';
import { ImportFromExcelComponent } from './mst-inventory-item/importFromExcel/importFromExcel.component';
import { ImportInventoryItemComponent } from './mst-inventory-item/importInventoryItem/importInventoryItem.component';
import { MstSupplierRequestComponent } from './mst-supplier-request/mst-supplier-request.component';
import { CreateOrEditMstIventoryGroupModalComponent } from './mst-iventory-group-modal/create-or-edit-mst-iventory-group-modal/create-or-edit-mst-iventory-group-modal.component';
import { MstIventoryGroupModalComponent } from './mst-iventory-group-modal/mst-iventory-group-modal.component';
import { MstPriceManagementComponent } from './mst-price-management/mst-price-management.component';
import { CreateEditProductManagementComponent } from './mst-product-management/create-edit-product-management/create-edit-product-management.component';
import { MstProductManagementComponent } from './mst-product-management/mst-product-management.component';
import { FrameworkContractCatalogComponent } from './framework-contract-catalog/framework-contract-catalog.component';
import { CreateOrEditFramewordContractCatalogComponent } from './framework-contract-catalog/create-or-edit-frameword-contract-catalog/create-or-edit-frameword-contract-catalog.component';
import { MstCancelReasonComponent } from './mst-cancel-reason/mst-cancel-reason.component';
import { CreateOrEditCancelReasonComponent } from './mst-cancel-reason/create-or-edit-cancel-reason/create-or-edit-cancel-reason.component';
import { MstProjectComponent } from './mst-project/mst-project.component';
import { CreateOrEditMstProjectComponent } from './mst-project/create-or-edit-mst-project/create-or-edit-mst-project.component';
import { MstQuotaExpenseComponent } from './mst-quota-expense/mst-quota-expense.component';
import { CreateOrEditQuotaExpenseComponent } from './mst-quota-expense/create-or-edit-quota-expense/create-or-edit-quota-expense.component';
import { CreateOrEditQuotaExpenseGroupComponent } from './mst-quota-expense/create-or-edit-quota-expense/create-or-edit-quota-expense-group.component';
import { CreateOrEditMstSupplierSiteComponent } from './mst-supplier/mst-supplier-site/create-or-edit-mst-supplier-site/create-or-edit-mst-supplier-site.component';
import { CreateOrEditMstSupplierComponent } from './mst-supplier/create-or-edit-mst-supplier/create-or-edit-mst-supplier.component';
import { MstProductGroupComponent } from './mst-product-group/mst-product-group.component';
import { CreateOrEditMstProductGroupComponent } from './mst-product-group/create-or-edit-mst-product-group/create-or-edit-mst-product-group.component';
import { CreateOrEditMstCurrencyComponent } from './mst-currency/create-or-edit-mst-currency/create-or-edit-mst-currency.component';
import { ImportPurchasePurposeComponent } from './mst-purchase-purpose/importPurchasePurpose/importPurchasePurpose.component';
import { MstListOfDocumentComponent } from './mst-list-of-document/mst-list-of-document.component';
import { CreateOrEditListOfDocumentComponent } from './mst-list-of-document/create-or-edit-list-of-document/create-or-edit-list-of-document.component';
import { ViewSupplierRequestInfoModalComponent } from './mst-supplier-request/view-supplier-request-info-modal/view-supplier-request-info-modal.component';
import { CreateOrEditCurrencyDataModalComponent } from './mst-currency-data/create-or-edit-currency-data-modal/create-or-edit-currency-data-modal.component';
import { MstInventoryCodeConfigComponent } from './mst-inventory-code-config/mst-inventory-code-config.component';
import { CreateOrEditInventoryCodeConfigComponent } from './mst-inventory-code-config/create-or-edit-inventory-code-config/create-or-edit-inventory-code-config.component';
import { RequestSupplierNoteModalComponent } from './mst-supplier-request/note-modal/request-supplier-note-modal.component';
import { MstAssessComponent } from './mst-assess/mst-assess.component';
import { CreateOrEditAssessComponent } from './mst-assess/create-or-edit-assess/create-or-edit-assess.component';
import { CreateOrEditAssessDetailComponent } from './mst-assess/create-or-edit-assess-detail/create-or-edit-assess-detail.component';
import { MstAssessGroupComponent } from './mst-assess-group/mst-assess-group.component';
import { CreateOrEditAssessGroupComponent } from './mst-assess-group/create-or-edit-assess-group/create-or-edit-assess-group.component';

const tabcode_component_dict = {
    [TABS.MASTER_TEST]: MasterTestComponent,
    [TABS.MASTER_PERIOD]: MstPeriodComponent,
    [TABS.MASTER_PURCHASE_PURPOSE]: MstPurchasePurposeComponent,
    [TABS.MASTER_CURRENCY]: MstCurrencyComponent,
    [TABS.MASTER_UNIT_OF_MEASURE]: MstUnitOfMeasureComponent,
    [TABS.MASTER_SUPPLIER]: MstSupplierComponent,
    [TABS.MASTER_SUPPLIER_REQUEST]: MstSupplierRequestComponent,
    [TABS.MASTER_APPROVAL_TREE]: ApprovalTreeComponent,
    [TABS.MASTER_INVENTORY_ITEM]: MstInventoryItemComponent,
    [TABS.MASTER_HR_ORG_STRUCTURE]: MstHrOrgComponent,
    [TABS.MASTER_INVENTORY_GROUP]: MstInventoryGroupComponent,
    [TABS.MASTER_INVENTORY_GROUP_MODAL]: MstIventoryGroupModalComponent,
    [TABS.MASTER_PRODUCT_INVENTORY_ITEM]: MstProductManagementComponent,
    [TABS.MASTER_PRICE_INVENTORY_ITEM]: MstPriceManagementComponent,
    [TABS.FRAMEWORK_CONTRACT_CATALOG]: FrameworkContractCatalogComponent,
    [TABS.MST_CANCEL_REASON]: MstCancelReasonComponent,
    [TABS.MASTER_CURRENCY_DATA]: MstCurrencyDataComponent,
    [TABS.MASTER_BUDGET_CODE]: BudgetCodeComponent,
    [TABS.MASTER_PROJECT]:MstProjectComponent,
    [TABS.MASTER_QUOTA_EXPENSE]:MstQuotaExpenseComponent,
    [TABS.MASTER_PRODUCT_GROUP]:MstProductGroupComponent,
    [TABS.MASTER_LIST_OF_DOCUMENT]:MstListOfDocumentComponent,
    [TABS.MASTER_CATALOG]:MstCatalogComponent,
    [TABS.MASTER_INVENTORY_CODE_CONFIG]:MstInventoryCodeConfigComponent,
    [TABS.MASTER_ASSESS]:MstAssessComponent,
    [TABS.MASTER_ASSESS_GROUP]:MstAssessGroupComponent,

};

@NgModule({
    declarations: [
        MasterTestComponent,
        MstPeriodComponent,
        CreateOrEditMstPeriodComponent,
        MstPurchasePurposeComponent,
        CreateOrEditMstPurchasePurposeComponent,
        CreateOrEditMstInventoryItemComponent,
        MstCurrencyComponent,
        MstUnitOfMeasureComponent,
        CreateOrEditMstUnitOfMeasureComponent,
        MstContactComponent,
        MstSupplierSiteComponent,
        MstSupplierComponent,
        CreateOrResetMstSupplierContactComponent,
        MstInventoryItemComponent,
        ApprovalTreeComponent,
        CreateOrEditApprovalTreeComponent,
        CreateOrEditApprovalTreeDetailComponent,
        MstHrOrgComponent,
        MstPersonnelComponent,
        MstInventoryGroupComponent,
        CreateOrEditMstInventoryGroupComponent,
        CreateOrEditMstInventoryItemPricesComponent,
        ImportFromExcelComponent,
        ImportInventoryItemComponent,
        MstSupplierRequestComponent,
        CreateRequestModalComponent,
        CreateOrEditMstIventoryGroupModalComponent,
        MstIventoryGroupModalComponent,
        MstPriceManagementComponent,
        CreateEditProductManagementComponent,
        MstProductManagementComponent,
        FrameworkContractCatalogComponent,
        CreateOrEditFramewordContractCatalogComponent,
        MstCurrencyDataComponent,
        BudgetCodeComponent,
        MstCancelReasonComponent,
        CreateOrEditCancelReasonComponent,
        MstProjectComponent,
        CreateOrEditMstProjectComponent,
        MstQuotaExpenseComponent,
        CreateOrEditQuotaExpenseComponent,
        CreateOrEditQuotaExpenseGroupComponent,
        CreateOrEditMstSupplierSiteComponent,
        CreateOrEditMstSupplierComponent,
        MstProductGroupComponent,
        CreateOrEditMstProductGroupComponent,
        CreateOrEditMstCurrencyComponent,
        ImportPurchasePurposeComponent,
        MstListOfDocumentComponent,
        CreateOrEditListOfDocumentComponent,
        // ViewSupplierRequestInfoModalComponent,
        CreateOrEditCurrencyDataModalComponent,
        MstCatalogComponent,
        CreateOrEditCatalogModalComponent,
        MstInventoryCodeConfigComponent,
        CreateOrEditInventoryCodeConfigComponent,
        RequestSupplierNoteModalComponent,
        MstAssessComponent,
        CreateOrEditAssessComponent,
        CreateOrEditAssessDetailComponent,
        MstAssessGroupComponent,
        CreateOrEditAssessGroupComponent
    ],
    imports: [CommonModule, AppCommonModule, FormsModule, UtilsModule, AdminSharedModule,AddSupplierRoutingModule],
    exports: [ImportFromExcelComponent]
})
export class MasterModule {
    static getComponent(tabCode: string) {
        return tabcode_component_dict[tabCode];
    }
}
