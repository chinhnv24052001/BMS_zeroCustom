import { MainModule } from '../../../app/main/main.module';
import { AddSupplierComponent } from './add-supplier.component';
import { AddSupplierRoutingModule } from './add-supplier.routing.module';

import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { CreateRequestModalComponent } from '../../../app/main/master/mst-supplier-request/create-request-modal/create-request-modal.component';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { AccountSharedModule } from '@account/shared/account-shared.module';
import { RegisterRoutingModule } from '../register-routing.module';
import { PasswordModule } from 'primeng/password';
import { LanguageSwitchDropdownComponent } from '@app/shared/layout/topbar/language-switch-dropdown.component';
import { AppModule } from '@app/app.module';
import { AccountModule } from '@account/account.module';

// NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

@NgModule({
    imports: [
        CommonModule, AppCommonModule, FormsModule, UtilsModule, AdminSharedModule,
        AddSupplierRoutingModule,
        AppSharedModule, AccountSharedModule, RegisterRoutingModule, PasswordModule,
        AccountModule,
    ],
    declarations: [
        AddSupplierComponent
    ],
})
export class AddSupplierModule { }
