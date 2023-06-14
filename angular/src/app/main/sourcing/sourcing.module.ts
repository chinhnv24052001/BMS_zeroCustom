import { ApprovalSharedModule } from './../approval-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { PriceManagementModule } from '../price-management/price-management.module';
import { PoModule } from '../po/po.module';
import { PrModule } from '../pr/pr.module';
import { UserRequestManagementModule } from '../user-request/user-request-management/user-request-management.module';
import { PaymentRequestModule } from '../payment/payment-request.module';
import { ManageApproveRequestComponent } from '../approve/manage-approve-request/manage-approve-request.component';
import { SourcingListComponent } from './sourcing-list/sourcing-list.component';

const tabcode_component_dict = {
  [TABS.SOURCING_LIST]: SourcingListComponent,
};

@NgModule({
  declarations: [
    SourcingListComponent,
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    FormsModule,
    UtilsModule,
    AdminSharedModule,
    ApprovalSharedModule,
    PoModule,PrModule,UserRequestManagementModule,
    PaymentRequestModule,
    PriceManagementModule
    // PriceManagementModule
  ],
  exports:[
    // ViewApprovalHistoryModalComponent
  ]
})
export class SourcingModule {
  static getComponent(tabCode: string) {
    return tabcode_component_dict[tabCode];
}
 }
