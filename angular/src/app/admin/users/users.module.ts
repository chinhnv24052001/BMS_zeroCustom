import {NgModule} from '@angular/core';
import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {AppSharedModule} from '@app/shared/app-shared.module';
import {UsersRoutingModule} from './users-routing.module';
import {UsersComponent} from './users.component';
import {EditUserPermissionsModalComponent} from './edit-user-permissions-modal.component';
import {CreateOrEditUserModalComponent} from './create-or-edit-user-modal.component';
import {DynamicEntityPropertyValueModule} from '@app/admin/dynamic-properties/dynamic-entity-properties/value/dynamic-entity-property-value.module';
import {ImpersonationService} from '@app/admin/users/impersonation.service';

@NgModule({
    declarations: [
        UsersComponent,
        EditUserPermissionsModalComponent,
        CreateOrEditUserModalComponent
    ],
    imports: [AppSharedModule, AdminSharedModule, UsersRoutingModule, DynamicEntityPropertyValueModule],
    providers: [ImpersonationService]
})
export class UsersModule {
}
