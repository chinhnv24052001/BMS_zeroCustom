import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainDashboardComponent } from './main-dashboard.component';
import { TABS } from '@app/shared/constants/tab-keys';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { DashboardConfigModalComponent } from './dashboard-config-modal/dashboard-config-modal.component';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';

const tabcode_component_dict = {
    [TABS.MAIN_DASHBOARD]: MainDashboardComponent,
};

@NgModule({
  imports: [
    CommonModule,
    AppCommonModule,
    FormsModule,
    UtilsModule,
    AdminSharedModule
  ],
  declarations: [MainDashboardComponent, DashboardConfigModalComponent]
})
export class MainDashboardModule {
    static getComponent(tabCode: string) {
        return tabcode_component_dict[tabCode];
    }
}
