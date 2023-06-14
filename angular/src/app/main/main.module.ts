import { AddSupplierModule } from '../../account/register/add-supplier/add-supplier.module';
import { ApproveModule } from './approve/approve.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { CountoModule } from 'angular2-counto';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { PopoverModule } from 'ngx-bootstrap/popover';
import { MainRoutingModule } from './main-routing.module';

import { BsDatepickerConfig, BsDaterangepickerConfig, BsLocaleService } from 'ngx-bootstrap/datepicker';
import { BsDatepickerModule } from 'ngx-bootstrap/datepicker';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { HomeComponent } from './home/home.component';
import { DynamicTabComponent } from '@app/shared/components/dynamic-tab/dynamic-tab.component';
import { AppSharedModule } from '@app/shared/app-shared.module';
import { TabDisplayDirective } from '@app/shared/components/tab-display/tab-display.directive';
import { MasterTestComponent } from './master/master-test/master-test.component';
import { MasterModule } from './master/master.module';
import { ButtonModule } from 'primeng/button';
import {PanelModule} from 'primeng/panel';
import { BuyRequestFromCatalogModule } from './user-request/buy-request-from-catalog/buy-request-from-catalog.module';
import { PrModule } from './pr/pr.module';
import { UserRequestManagementModule } from './user-request/user-request-management/user-request-management.module';
import { GrModule } from './gr/gr.module';
import { PaymentRequestModule } from './payment/payment-request.module';
import { InvoiceComponent } from '@app/admin/subscription-management/invoice/invoice.component';
import { PoModule } from './po/po.module';
import { MainDashboardModule } from './dashboard/main-dashboard/main-dashboard.module';
import { BmsMasterModule } from './bms-master/bms-master.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import { SourcingModule } from './sourcing/sourcing.module';
import { BmsBudgetTransferModule } from './bms-budget-transfer/bms-budget-transfer.module';
import { BmsBudgetReviewModule } from './bms-budget-review-control/bms-budget-review.module';

NgxBootstrapDatePickerConfigService.registerNgxBootstrapDatePickerLocales();

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ModalModule,
        TabsModule,
        TooltipModule,
        AppCommonModule,
        UtilsModule,
        MainRoutingModule,
        CountoModule,
        BsDatepickerModule.forRoot(),
        BsDropdownModule.forRoot(),
        PopoverModule.forRoot(),
        MasterModule,
        PanelModule,
        BuyRequestFromCatalogModule,
        PrModule,
        UserRequestManagementModule,
        PoModule,
        GrModule,
        ApproveModule,
        PaymentRequestModule,
        MainDashboardModule,
        BmsMasterModule,
        SourcingModule,
        BmsBudgetTransferModule,
        BmsBudgetReviewModule
    ],
    declarations: [
        DashboardComponent,
        HomeComponent,
        DynamicTabComponent,
        TabDisplayDirective,
    ],
    providers: [
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: BsLocaleService, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerLocale }
    ]
})
export class MainModule { }
