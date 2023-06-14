import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PurchaseRequestComponent } from './purchase-request/purchase-request.component';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { CreateOrEditPurchaseRequestComponent } from './purchase-request/create-or-edit-purchase-request/create-or-edit-purchase-request.component';
import { ViewPurchaseRequestComponent } from './purchase-request/view-purchase-request/view-purchase-request.component';
import { PurchaseRequestDistributionsModalComponent } from './purchase-request/purchase-request-distributions-modal/purchase-request-distributions-modal.component';
import { ForwardPurchaseRequestComponent } from './purchase-request/forward-purchase-request/forward-purchase-request.component';
import { ImportPurchaseRequestComponent } from './purchase-request/import-purchase-request/import-purchase-request.component';
import { AutoCreatePrComponent } from './auto-create-pr/auto-create-pr.component';

const tabcode_component_dict = {
  [TABS.PURCHASE_REQUEST]: PurchaseRequestComponent,
  [TABS.CREATE_OR_EDIT_PURCHASE_REQUEST]: CreateOrEditPurchaseRequestComponent,
  [TABS.UR_AUTO_CREATE_PR]: AutoCreatePrComponent
};

@NgModule({
  declarations: [
    PurchaseRequestComponent,
    CreateOrEditPurchaseRequestComponent,
    ViewPurchaseRequestComponent,
    PurchaseRequestDistributionsModalComponent,
    ForwardPurchaseRequestComponent,
    ImportPurchaseRequestComponent,
    AutoCreatePrComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    FormsModule,
    UtilsModule,
    AdminSharedModule,
  ],
  exports:[
    ViewPurchaseRequestComponent
  ]
})
export class PrModule {
  static getComponent(tabCode: string) {
    return tabcode_component_dict[tabCode];
}
 }
