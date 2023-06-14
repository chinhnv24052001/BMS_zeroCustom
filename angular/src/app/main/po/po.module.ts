import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseOrdersComponent } from './purchase-orders/purchase-orders.component';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { TABS } from '@app/shared/constants/tab-keys';
import { CreateOrEditPurchaseOrdersComponent } from './purchase-orders/create-or-edit-purchase-orders/create-or-edit-purchase-orders.component';
import { AutoCreatePurchaseOrdersComponent } from './auto-create-purchase-orders/auto-create-purchase-orders.component';
import { PurchaseOrdersShipmentsComponent } from './purchase-orders/purchase-orders-shipments/purchase-orders-shipments.component';
import { PurchaseOrdersDistributionsComponent } from './purchase-orders/purchase-orders-distributions/purchase-orders-distributions.component';
import { ImportPurchaseOrdersComponent } from './purchase-orders/import-purchase-orders/import-purchase-orders.component';
import { ViewDetailPurchaseOrdersComponent } from './purchase-orders/view-detail-purchase-orders/view-detail-purchase-orders.component';
import { AutoCreatePoFromContractComponent } from './auto-create-po-from-contract/auto-create-po-from-contract.component';
import { AddPurchaseRequestToPurchaseOrdersModalComponent } from './auto-create-purchase-orders/add-purchase-request-to-purchase-orders-modal/add-purchase-request-to-purchase-orders-modal.component';
import { NoteModalSupplierConfirmComponent } from './purchase-orders/note-modal-supplier-confirm/note-modal-supplier-confirm.component';
import { PurchaseOrderTermsModalComponent } from './purchase-orders/purchase-order-terms-modal/purchase-order-terms-modal.component';
import { SelectTemplatePrintContractComponent } from './purchase-orders/select-template-print-contract/select-template-print-contract.component';
import { AddDescriptionsForAutoCraetePoComponent } from './auto-create-purchase-orders/add-descriptions-for-auto-craete-po/add-descriptions-for-auto-craete-po.component';
import { UpdateInventoryGroupModalComponent } from './auto-create-purchase-orders/update-inventory-group-modal/update-inventory-group-modal.component';

const tabcode_component_dict = {
  [TABS.PURCHASE_ORDERS]: PurchaseOrdersComponent,
  [TABS.CREATE_OR_EDIT_PURCHASE_ORDERS]: CreateOrEditPurchaseOrdersComponent,
  [TABS.AUTO_CREATE_PURCHASE_ORDERS]: AutoCreatePurchaseOrdersComponent,
  [TABS.AUTO_CREATE_PURCHASE_ORDERS_FROM_CONTRACT]: AutoCreatePoFromContractComponent,
};

@NgModule({
  declarations: [
    PurchaseOrdersComponent,
    CreateOrEditPurchaseOrdersComponent,
    AutoCreatePurchaseOrdersComponent,
    PurchaseOrdersShipmentsComponent,
    PurchaseOrdersDistributionsComponent,
    ImportPurchaseOrdersComponent,
    ViewDetailPurchaseOrdersComponent,
    AutoCreatePoFromContractComponent,
    AddPurchaseRequestToPurchaseOrdersModalComponent,
    NoteModalSupplierConfirmComponent,
    PurchaseOrderTermsModalComponent,
    SelectTemplatePrintContractComponent,
    AddDescriptionsForAutoCraetePoComponent,
    UpdateInventoryGroupModalComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    FormsModule,
    UtilsModule,
    AdminSharedModule
  ],
  exports:[
    ViewDetailPurchaseOrdersComponent
  ]
})
export class PoModule {
  static getComponent(tabCode: string) {
    return tabcode_component_dict[tabCode];
  }
}
