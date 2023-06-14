import { ApprovalSharedModule } from './../approval-shared.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { ViewApprovalHistoryModalComponent } from './view-approval-history-modal/view-approval-history-modal.component';
import { ManageApproveRequestComponent } from './manage-approve-request/manage-approve-request.component';
import { ForwardApproveRequestModalComponent } from './forward-approve-request-modal/forward-approve-request-modal.component';
import { PriceManagementModule } from '../price-management/price-management.module';
import { PoModule } from '../po/po.module';
import { PrModule } from '../pr/pr.module';
import { UserRequestManagementModule } from '../user-request/user-request-management/user-request-management.module';
import { NoteModalComponent } from './manage-approve-request/note-modal/note-modal.component';
import { PaymentRequestModule } from '../payment/payment-request.module';

const tabcode_component_dict = {
  [TABS.APPROVE_REQUEST]: ManageApproveRequestComponent,
};

@NgModule({
  declarations: [
    ManageApproveRequestComponent,
    // ViewApprovalHistoryModalComponent,
    ForwardApproveRequestModalComponent,
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
export class ApproveModule {
  static getComponent(tabCode: string) {
    return tabcode_component_dict[tabCode];
}
 }
