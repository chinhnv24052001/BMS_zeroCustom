import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { TABS } from '@app/shared/constants/tab-keys';
import { CreateOrEditBmsBudgetTransferUserComponent } from './bms-budget-transfer-user/create-or-edit-bms-budget-transfer-user/create-or-edit-bms-budget-transfer-user.component';
import { BmsBudgetTransferComponent } from './bms-budget-transfer-user/bms-budget-transfer-user.component';
import { BmsBudgetAdditionComponent } from './bms-budget-transfer-user/bms-budget-addition/bms-budget-addition.component';

const tabcode_component_dict = {
    [TABS.BMS_BUDGET_TRANSFER]: BmsBudgetTransferComponent, 
};

@NgModule({
  declarations: [
    // CreateOrEditBmsMstSegment1Component,
    CreateOrEditBmsBudgetTransferUserComponent,
    BmsBudgetTransferComponent,
    BmsBudgetAdditionComponent
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
export class BmsBudgetTransferModule {
  static getComponent(tabCode: string) {
    return tabcode_component_dict[tabCode];
  }
}
