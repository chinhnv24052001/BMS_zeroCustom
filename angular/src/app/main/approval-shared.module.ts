import { UserRequestManagementModule } from './user-request/user-request-management/user-request-management.module';
import { PrModule } from './pr/pr.module';


import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { FrameworkContractModalComponent } from './price-management/framework-contract/framework-contract-modal/framework-contract-modal.component';
import { AddSupplierRoutingModule } from '../../account/register/add-supplier/add-supplier.routing.module';
import { ViewApprovalHistoryModalComponent } from './approve/view-approval-history-modal/view-approval-history-modal.component';
import { PoModule } from './po/po.module';
import { NoteModalComponent } from './approve/manage-approve-request/note-modal/note-modal.component';



// const tabcode_component_dict = {
// };

@NgModule({
    declarations: [
        FrameworkContractModalComponent,
        ViewApprovalHistoryModalComponent,
        NoteModalComponent

    ],
    imports: [CommonModule, AppCommonModule, FormsModule, UtilsModule, AdminSharedModule,AddSupplierRoutingModule ],
    exports: [
        FrameworkContractModalComponent,
        ViewApprovalHistoryModalComponent,
        NoteModalComponent
    ]
})
export class ApprovalSharedModule {
    // static getComponent(tabCode: string) {
    //     return tabcode_component_dict[tabCode];
    // }
}
