import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { TABS } from '@app/shared/constants/tab-keys';
import { CreateOrEditBmsMstSegment1Component } from './bms-mst-segment1/create-or-edit-bms-mst-segment1/create-or-edit-bms-mst-segment1.component';
import { BmsMstSegment1Component } from './bms-mst-segment1/bms-mst-segment1.component';
import { BmsMstSegment2Component } from './bms-mst-segment2/bms-mst-segment2.component';
import { CreateOrEditBmsMstSegment2Component } from './bms-mst-segment2/create-or-edit-bms-mst-segment2/create-or-edit-bms-mst-segment2.component';
import { CreateOrEditBmsMstSegment3Component } from './bms-mst-segment3/create-or-edit-bms-mst-segment3/create-or-edit-bms-mst-segment3.component';
import { BmsMstSegment3Component } from './bms-mst-segment3/bms-mst-segment3.component';
import { BmsMstSegment4Component } from './bms-mst-segment4/bms-mst-segment4.component';
import { CreateOrEditBmsMstSegment4Component } from './bms-mst-segment4/create-or-edit-bms-mst-segment4/create-or-edit-bms-mst-segment4.component';
import { CreateOrEditBmsMstSegment5Component } from './bms-mst-segment5/create-or-edit-bms-mst-segment5/create-or-edit-bms-mst-segment5.component';
import { BmsMstSegment5Component } from './bms-mst-segment5/bms-mst-segment5.component';
import { CreateOrEditBmsMstPeriodVersionComponent } from './bms-mst-period/bms-mst-period-version/create-or-edit-bms-mst-period-version/create-or-edit-bms-mst-period-version.component';
import { BmsMstPeriodVersionComponent } from './bms-mst-period/bms-mst-period-version/bms-mst-period-version.component';
import { CreateOrEditBmsMstPeriodComponent } from './bms-mst-period/create-or-edit-bms-mst-period/create-or-edit-bms-mst-period.component';
import { BmsMstPeriodComponent } from './bms-mst-period/bms-mst-period.component';
import { BmsImportSegmentComponent } from './bms-import-segment/import-segment.component';
import { CreateOrEditBmsMstPairingSegmentGroupComponent } from './bms-mst-pairing-segment/create-or-edit-bms-mst-pairing-segment/create-or-edit-bms-mst-pairing-segment.component';
import { BmsMstPairingSegmentComponent } from './bms-mst-pairing-segment/bms-mst-pairing-segment.component';
import { CreateOrEditBmsMstSegment1TypeCostComponent } from './bms-mst-segment1-type-cost/create-or-edit-bms-mst-segment1-type-cost/create-or-edit-bms-mst-segment1-type-cost.component';
import { BmsMstSegment1TypeCostComponent } from './bms-mst-segment1-type-cost/bms-mst-segment1-type-cost.component';
import { CreateOrEditBmsMstSegment2ProjectTypeComponent } from './bms-mst-segment2-project-type/create-or-edit-bms-mst-segment2-project-type/create-or-edit-bms-mst-segment2-project-type.component';
import { BmsMstSegment2ProjectTypeComponent } from './bms-mst-segment2-project-type/bms-mst-segment2-project-type.component';
import { CreateOrEditBmsMstSegment4GroupComponent } from './bms-mst-segment4-group/create-or-edit-bms-mst-segment4-group/create-or-edit-bms-mst-segment4-group.component';
import { BmsMstSegment4GroupComponent } from './bms-mst-segment4-group/bms-mst-segment4-group.component';
import { CreateOrEditBmsMstExchangeRateComponent } from './bms-mst-exchange-rate/create-or-edit-bms-mst-exchange-rate/create-or-edit-bms-mst-exchange-rate.component';
import { BmsMstExchangeRateComponent } from './bms-mst-exchange-rate/bms-mst-exchange-rate.component';
import { BmsMstProjectCodeComponent } from './bms-mst-project-code/bms-mst-project-code.component';
import { CreateOrEditBmsMstProjectCodeComponent } from './bms-mst-project-code/create-or-edit-bms-mst-project-code/create-or-edit-bms-mst-project-code.component';
import { CreateOrEditMultipleBmsMstProjectCodeComponent } from './bms-mst-project-code/create-or-edit-multiple-bms-mst-project-code/create-or-edit-multiple-bms-mst-project-code.component';
import { BmsUserbudgetControlComponent } from './bms-user-budget-control/bms-user-budget-control.component';
import { AddBmsUserBudgetControlComponent } from './bms-user-budget-control/add-bms-user-budget-control/add-bms-user-budget-control.component';

const tabcode_component_dict = {
   [TABS.BMS_MST_SEGMENT1]: BmsMstSegment1Component, 
   [TABS.BMS_MST_SEGMENT2]: BmsMstSegment2Component,
   [TABS.BMS_MST_SEGMENT3]: BmsMstSegment3Component,
   [TABS.BMS_MST_SEGMENT4]: BmsMstSegment4Component,
   [TABS.BMS_MST_SEGMENT5]: BmsMstSegment5Component,
   [TABS.BMS_MST_PERIOD]: BmsMstPeriodComponent,
   [TABS.BMS_MST_PAIRING_SEGMENT]: BmsMstPairingSegmentComponent,
   [TABS.BMS_MST_SEGMENT1_TYPE_COST]: BmsMstSegment1TypeCostComponent,
   [TABS.BMS_MST_SEGMENT2_PROJECT_TYPE]: BmsMstSegment2ProjectTypeComponent,
   [TABS.BMS_MST_SEGMENT4_GROUP]: BmsMstSegment4GroupComponent, 
   [TABS.BMS_MST_EXCHANGE_RATE]: BmsMstExchangeRateComponent,
   [TABS.BMS_MST_PROJECT_CODE]: BmsMstProjectCodeComponent, 
   [TABS.BMS_USER_BUDGET_CONTROL]: BmsUserbudgetControlComponent,
};

@NgModule({
  declarations: [
    // AddDescriptionsForAutoCraetePoComponent
    CreateOrEditBmsMstSegment1Component,
    BmsMstSegment1Component,
    BmsMstSegment2Component,
    CreateOrEditBmsMstSegment2Component,
    CreateOrEditBmsMstSegment3Component,
    BmsMstSegment3Component,
    BmsMstSegment4Component,
    CreateOrEditBmsMstSegment4Component,
    CreateOrEditBmsMstSegment5Component,
    BmsMstSegment5Component,
    CreateOrEditBmsMstPeriodVersionComponent,
    BmsMstPeriodVersionComponent,
    CreateOrEditBmsMstPeriodComponent,
    BmsMstPeriodComponent,
    BmsImportSegmentComponent,
    CreateOrEditBmsMstPairingSegmentGroupComponent,
    BmsMstPairingSegmentComponent,
    CreateOrEditBmsMstSegment1TypeCostComponent,
    BmsMstSegment1TypeCostComponent,
    CreateOrEditBmsMstSegment2ProjectTypeComponent,
    BmsMstSegment2ProjectTypeComponent,
    CreateOrEditBmsMstSegment4GroupComponent,
    BmsMstSegment4GroupComponent,
    CreateOrEditBmsMstExchangeRateComponent,
    BmsMstExchangeRateComponent,
    CreateOrEditBmsMstProjectCodeComponent,
    BmsMstProjectCodeComponent,
    CreateOrEditMultipleBmsMstProjectCodeComponent,
    BmsUserbudgetControlComponent,
    AddBmsUserBudgetControlComponent
  ],
  imports: [
    CommonModule,
    AppCommonModule,
    FormsModule,
    UtilsModule,
    AdminSharedModule
  ],
  exports:[
    // ViewDetailPurchaseOrdersComponent
  ]
})
export class BmsMasterModule {
  static getComponent(tabCode: string) {
    return tabcode_component_dict[tabCode];
  }
}
