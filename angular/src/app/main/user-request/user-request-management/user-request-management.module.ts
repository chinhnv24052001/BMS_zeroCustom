import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRequestManagementComponent } from './user-request-management.component';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { CreateOrEditUserRequestComponent } from './create-or-edit-user-request/create-or-edit-user-request.component';
import { CreatePurchasingRequestModalComponent } from './create-purchasing-request-modal/create-purchasing-request-modal.component';
import { ViewUserRequestModalComponent } from './view-user-request-modal/view-user-request-modal.component';
import { ImportUserRequestModalComponent } from './import-user-request-modal/import-user-request-modal.component';

const tabcode_component_dict = {
    [TABS.UR_REQUEST]: UserRequestManagementComponent,
    [TABS.UR_CREATE_USER_REQUEST]: CreateOrEditUserRequestComponent,
};

@NgModule({
    imports: [
        CommonModule,
        AppCommonModule,
        FormsModule,
        UtilsModule,
        AdminSharedModule,
    ],
    declarations: [
        UserRequestManagementComponent,
        CreateOrEditUserRequestComponent,
        CreatePurchasingRequestModalComponent,
        ViewUserRequestModalComponent,
        ImportUserRequestModalComponent
    ],
    exports:[
        ViewUserRequestModalComponent
    ]
})
export class UserRequestManagementModule {
    static getComponent(tabCode: string) {
        return tabcode_component_dict[tabCode];
    }
}
