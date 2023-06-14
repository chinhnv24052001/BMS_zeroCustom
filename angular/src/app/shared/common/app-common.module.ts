import { AddUserStepModalComponent } from './view-list-approve-detail/add-user-step-modal/add-user-step-modal.component';
import { ImportAttachFileComponent } from './import-attach-file/import-attach-file.component';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppLocalizationService } from '@app/shared/common/localization/app-localization.service';
import { AppNavigationService } from '@app/shared/layout/nav/app-navigation.service';
import { tmssCommonModule } from '@shared/common/common.module';
import { UtilsModule } from '@shared/utils/utils.module';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TabsModule } from 'ngx-bootstrap/tabs';
import { BsDropdownModule } from 'ngx-bootstrap/dropdown';
import { BsDatepickerModule, BsDatepickerConfig, BsDaterangepickerConfig } from 'ngx-bootstrap/datepicker';
import { PaginatorModule } from 'primeng/paginator';
import { TableModule } from 'primeng/table';
import { AppAuthService } from './auth/app-auth.service';
import { AppRouteGuard } from './auth/auth-route-guard';
import { CommonLookupModalComponent } from './lookup/common-lookup-modal.component';
import { EntityTypeHistoryModalComponent } from './entityHistory/entity-type-history-modal.component';
import { EntityChangeDetailModalComponent } from './entityHistory/entity-change-detail-modal.component';
import { DateRangePickerInitialValueSetterDirective } from './timing/date-range-picker-initial-value.directive';
import { DatePickerInitialValueSetterDirective } from './timing/date-picker-initial-value.directive';
import { DateTimeService } from './timing/date-time.service';
import { TimeZoneComboComponent } from './timing/timezone-combo.component';
import { GridsterModule } from 'angular-gridster2';
import { NgxBootstrapDatePickerConfigService } from 'assets/ngx-bootstrap/ngx-bootstrap-datepicker-config.service';
import { PerfectScrollbarModule } from 'ngx-perfect-scrollbar';
import { CountoModule } from 'angular2-counto';
import { AppBsModalModule } from '@shared/common/appBsModal/app-bs-modal.module';
import { SingleLineStringInputTypeComponent } from './input-types/single-line-string-input-type/single-line-string-input-type.component';
import { ComboboxInputTypeComponent } from './input-types/combobox-input-type/combobox-input-type.component';
import { CheckboxInputTypeComponent } from './input-types/checkbox-input-type/checkbox-input-type.component';
import { MultipleSelectComboboxInputTypeComponent } from './input-types/multiple-select-combobox-input-type/multiple-select-combobox-input-type.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { PasswordInputWithShowButtonComponent } from './password-input-with-show-button/password-input-with-show-button.component';
import { KeyValueListManagerComponent } from './key-value-list-manager/key-value-list-manager.component';
import { SubHeaderComponent } from '@app/shared/common/sub-header/sub-header.component';
import { GridTableComponent } from './grid-table/grid-table.component';
import { GridPaginationComponent } from './grid-pagination/grid-pagination.component';
import { AgGridModule } from '@ag-grid-community/angular-legacy';
import { DataFormatService } from '../services/data-format.service';
import { TmssTextInputComponent } from './input-types/tmss-text-input/tmss-text-input.component';
import { TmssCheckboxComponent } from './input-types/tmss-checkbox/tmss-checkbox.component';
import { TmssComboboxComponent } from './input-types/tmss-combobox/tmss-combobox.component';
import { TmssDatepickerComponent } from './input-types/tmss-datepicker/tmss-datepicker.component';
import { TmssTextareaComponent } from './input-types/tmss-textarea/tmss-textarea.component';
import { AddonWidthDirective } from '@shared/utils/addon-width.directive';
import { AgCellButtonRendererComponent } from './grid-input-types/ag-cell-button-renderer/ag-cell-button-renderer.component';
import { AgCheckboxRendererComponent } from './grid-input-types/ag-checkbox-renderer/ag-checkbox-renderer.component';
import { AgDatepickerRendererComponent } from './grid-input-types/ag-datepicker-renderer/ag-datepicker-renderer.component';
import { AgDropdownRendererComponent } from './grid-input-types/ag-dropdown-renderer/ag-dropdown-renderer.component';
import { AgFilterGridComponent } from './grid-input-types/ag-filter-grid/ag-filter-grid.component';
import { AgFloatingFilterGridComponent } from './grid-input-types/ag-floating-filter-grid/ag-floating-filter-grid.component';
import { AgHeaderButtonGridComponent } from './grid-input-types/ag-header-button-grid/ag-header-button-grid.component';
import { TmssMultiColumnDropdownComponent } from './grid-input-types/tmss-multi-column-dropdown/tmss-multi-column-dropdown.component';
import { TmssSelectGridModalComponent } from './grid-input-types/tmss-select-grid-modal/tmss-select-grid-modal.component';
import { TmssSearchInputComponent } from './input-types/tmss-search-input/tmss-search-input.component';
import { AgDataValidateService } from '../services/ag-data-validate.service';
import { TmssMultiselectComponent } from './input-types/tmss-multiselect/tmss-multiselect.component';
import {MultiSelectModule} from 'primeng/multiselect';
import { AbpHttpInterceptor } from 'abp-ng2-module';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgSelectModule } from '@ng-select/ng-select';
import { ViewListApproveDetailComponent } from './view-list-approve-detail/view-list-approve-detail.component';
import { ViewSupplierRequestInfoModalComponent } from '@app/main/master/mst-supplier-request/view-supplier-request-info-modal/view-supplier-request-info-modal.component';
import { NoteModalComponent } from '@app/main/approve/manage-approve-request/note-modal/note-modal.component';
import { AddNewStepModalComponent } from './view-list-approve-detail/add-new-step-modal/add-new-step-modal.component';
import { AddWidgetModalComponent } from './customizable-dashboard/add-widget-modal/add-widget-modal.component';
import { CustomizableDashboardComponent } from './customizable-dashboard/customizable-dashboard.component';
import { FilterDateRangePickerComponent } from './customizable-dashboard/filters/filter-date-range-picker/filter-date-range-picker.component';
import { WidgetDailySalesComponent } from './customizable-dashboard/widgets/widget-daily-sales/widget-daily-sales.component';
import { WidgetEditionStatisticsComponent } from './customizable-dashboard/widgets/widget-edition-statistics/widget-edition-statistics.component';
import { WidgetGeneralStatsComponent } from './customizable-dashboard/widgets/widget-general-stats/widget-general-stats.component';
import { WidgetHostTopStatsComponent } from './customizable-dashboard/widgets/widget-host-top-stats/widget-host-top-stats.component';
import { WidgetIncomeStatisticsComponent } from './customizable-dashboard/widgets/widget-income-statistics/widget-income-statistics.component';
import { WidgetMemberActivityComponent } from './customizable-dashboard/widgets/widget-member-activity/widget-member-activity.component';
import { WidgetProfitShareComponent } from './customizable-dashboard/widgets/widget-profit-share/widget-profit-share.component';
import { WidgetRecentTenantsComponent } from './customizable-dashboard/widgets/widget-recent-tenants/widget-recent-tenants.component';
import { WidgetRegionalStatsComponent } from './customizable-dashboard/widgets/widget-regional-stats/widget-regional-stats.component';
import { WidgetSalesSummaryComponent } from './customizable-dashboard/widgets/widget-sales-summary/widget-sales-summary.component';
import { WidgetSubscriptionExpiringTenantsComponent } from './customizable-dashboard/widgets/widget-subscription-expiring-tenants/widget-subscription-expiring-tenants.component';
import { WidgetTopStatsComponent } from './customizable-dashboard/widgets/widget-top-stats/widget-top-stats.component';
import { NgxChartsModule } from '@swimlane/ngx-charts';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        ModalModule.forRoot(),
        UtilsModule,
        tmssCommonModule,
        TableModule,
        PaginatorModule,
        GridsterModule,
        TabsModule.forRoot(),
        BsDropdownModule.forRoot(),
        BsDatepickerModule.forRoot(),
        PerfectScrollbarModule,
        CountoModule,
        AppBsModalModule,
        AutoCompleteModule,
        AgGridModule,
        MultiSelectModule,
        NgSelectModule,
        NgxChartsModule
    ],
    declarations: [
        TimeZoneComboComponent,
        CommonLookupModalComponent,
        EntityTypeHistoryModalComponent,
        EntityChangeDetailModalComponent,
        DateRangePickerInitialValueSetterDirective,
        DatePickerInitialValueSetterDirective,
        CustomizableDashboardComponent,
        WidgetGeneralStatsComponent,
        WidgetDailySalesComponent,
        WidgetEditionStatisticsComponent,
        WidgetHostTopStatsComponent,
        WidgetIncomeStatisticsComponent,
        WidgetMemberActivityComponent,
        WidgetProfitShareComponent,
        WidgetRecentTenantsComponent,
        WidgetRegionalStatsComponent,
        WidgetSalesSummaryComponent,
        WidgetSubscriptionExpiringTenantsComponent,
        WidgetTopStatsComponent,
        FilterDateRangePickerComponent,
        AddWidgetModalComponent,
        SingleLineStringInputTypeComponent,
        ComboboxInputTypeComponent,
        CheckboxInputTypeComponent,
        MultipleSelectComboboxInputTypeComponent,
        PasswordInputWithShowButtonComponent,
        KeyValueListManagerComponent,
        SubHeaderComponent,
        GridTableComponent,
        GridPaginationComponent,
        TmssTextInputComponent,
        TmssCheckboxComponent,
        TmssComboboxComponent,
        TmssDatepickerComponent,
        TmssTextareaComponent,
        AddonWidthDirective,
        AgCellButtonRendererComponent,
        AgCheckboxRendererComponent,
        AgDatepickerRendererComponent,
        AgDropdownRendererComponent,
        AgFilterGridComponent,
        AgFloatingFilterGridComponent,
        AgHeaderButtonGridComponent,
        TmssMultiColumnDropdownComponent,
        TmssSelectGridModalComponent,
        TmssSearchInputComponent,
        TmssMultiselectComponent,
        ImportAttachFileComponent,
        ViewListApproveDetailComponent,
        ViewSupplierRequestInfoModalComponent,
        AddUserStepModalComponent,
        AddNewStepModalComponent,

    ],
    exports: [
        TimeZoneComboComponent,
        CommonLookupModalComponent,
        EntityTypeHistoryModalComponent,
        EntityChangeDetailModalComponent,
        DateRangePickerInitialValueSetterDirective,
        DatePickerInitialValueSetterDirective,
        PasswordInputWithShowButtonComponent,
        KeyValueListManagerComponent,
        CustomizableDashboardComponent,
        SubHeaderComponent,
        GridTableComponent,
        GridPaginationComponent,
        TmssTextInputComponent,
        TmssCheckboxComponent,
        TmssComboboxComponent,
        TmssDatepickerComponent,
        TmssTextareaComponent,
        AddonWidthDirective,
        AgCellButtonRendererComponent,
        AgCheckboxRendererComponent,
        AgDatepickerRendererComponent,
        AgDropdownRendererComponent,
        AgFilterGridComponent,
        AgFloatingFilterGridComponent,
        AgHeaderButtonGridComponent,
        TmssMultiColumnDropdownComponent,
        TmssSelectGridModalComponent,
        TmssSearchInputComponent,
        TmssMultiselectComponent,
        ImportAttachFileComponent,
        ViewListApproveDetailComponent,
        ViewSupplierRequestInfoModalComponent,
        AddUserStepModalComponent,
        AddNewStepModalComponent,
    ],
    providers: [
        DateTimeService,
        AppLocalizationService,
        AppNavigationService,
        DataFormatService,
        AgDataValidateService,
        { provide: BsDatepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDatepickerConfig },
        { provide: BsDaterangepickerConfig, useFactory: NgxBootstrapDatePickerConfigService.getDaterangepickerConfig },
        { provide: HTTP_INTERCEPTORS, useClass: AbpHttpInterceptor, multi: true }
    ],

    entryComponents: [
        SingleLineStringInputTypeComponent,
        ComboboxInputTypeComponent,
        CheckboxInputTypeComponent,
        MultipleSelectComboboxInputTypeComponent,
        TmssTextInputComponent,
        TmssCheckboxComponent,
        TmssComboboxComponent,
        TmssDatepickerComponent,
        TmssTextareaComponent,
        AgCellButtonRendererComponent,
        AgCheckboxRendererComponent,
        AgDatepickerRendererComponent,
        AgDropdownRendererComponent,
        AgFilterGridComponent,
        AgFloatingFilterGridComponent,
        AgHeaderButtonGridComponent,
        TmssMultiColumnDropdownComponent,
        TmssSelectGridModalComponent,
        TmssSearchInputComponent,
        TmssMultiselectComponent,
        ImportAttachFileComponent
    ]
})
export class AppCommonModule {
    static forRoot(): ModuleWithProviders<AppCommonModule> {
        return {
            ngModule: AppCommonModule,
            providers: [
                AppAuthService,
                AppRouteGuard
            ]
        };
    }
}
