import { ApprovalSharedModule } from './../approval-shared.module';
import { MasterModule } from './../master/master.module';
import { FrameworkContractModalComponent } from './framework-contract/framework-contract-modal/framework-contract-modal.component';
import { FrameworkContractComponent } from './framework-contract/framework-contract.component';

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { AddSupplierRoutingModule } from '../../../account/register/add-supplier/add-supplier.routing.module';
import { AddSupplierModule } from '../../../account/register/add-supplier/add-supplier.module';
import { FileSaverModule } from 'ngx-filesaver';
import { ApproveModule } from '../approve/approve.module';
import { CreateOrEditPrcContractTemplateComponent } from './framework-contract/create-or-edit-prc-contract-template/create-or-edit-prc-contract-template.component';
import { CreateOrEditAppendixContractComponent } from './framework-contract/create-or-edit-appendix-contract/create-or-edit-appendix-contract.component';
import { CreateOrEditAppendixItemsComponent } from './framework-contract/create-or-edit-appendix-items/create-or-edit-appendix-items.component';
import { ImportMultipleContractComponent } from './framework-contract/import-multiple-contract/import-multiple-contract.component';
import { CreateContractBackdateModalComponent } from './framework-contract/create-contract-backdate-modal/create-contract-backdate-modal.component';


const tabcode_component_dict = {
    [TABS.FRAMEWORK_CONTRACT_MANAGEMENT]: FrameworkContractComponent,
};

@NgModule({
    declarations: [
        FrameworkContractComponent,
        CreateOrEditPrcContractTemplateComponent,
        CreateOrEditAppendixContractComponent,
        CreateOrEditAppendixItemsComponent,
        ImportMultipleContractComponent,
        CreateContractBackdateModalComponent
        // FrameworkContractModalComponent
    ],
    imports: [CommonModule, AppCommonModule, FormsModule, UtilsModule, AdminSharedModule,AddSupplierRoutingModule ,FileSaverModule,MasterModule,ApprovalSharedModule],
    exports: [
        // FrameworkContractModalComponent
        CreateOrEditAppendixContractComponent
    ]
})
export class PriceManagementModule {
    static getComponent(tabCode: string) {
        return tabcode_component_dict[tabCode];
    }
}
