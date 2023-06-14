import {NgModule} from '@angular/core';
import {AdminSharedModule} from '@app/admin/shared/admin-shared.module';
import {AppSharedModule} from '@app/shared/app-shared.module';
import {AuditLogsRoutingModule} from './audit-logs-routing.module';
import {AuditLogsComponent} from './audit-logs.component';
import {AuditLogDetailModalComponent} from './audit-log-detail-modal.component';
import { CommonModule } from '@angular/common';
import { AppCommonModule } from '@app/shared/common/app-common.module';

@NgModule({
    declarations: [AuditLogsComponent, AuditLogDetailModalComponent],
    imports: [AppSharedModule, AdminSharedModule, AuditLogsRoutingModule, AppCommonModule]
})
export class AuditLogsModule {
}
