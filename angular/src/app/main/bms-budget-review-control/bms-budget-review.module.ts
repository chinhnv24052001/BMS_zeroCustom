import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppCommonModule } from '@app/shared/common/app-common.module';
import { FormsModule } from '@angular/forms';
import { UtilsModule } from '@shared/utils/utils.module';
import { AdminSharedModule } from '@app/admin/shared/admin-shared.module';
import { TABS } from '@app/shared/constants/tab-keys';
import { BmsMonthlyBudgetPlanComponent } from './bms-budget-review/bms-tab-child/bms-monthly-budget-plan/bms-monthly-budget-plan.component';
import { BmsBudgetReviewComponent } from './bms-budget-review/bms-budget-review.component';
import { BmsMonthlyCashPlanComponent } from './bms-budget-review/bms-tab-child/bms-monthly-cash-plan/bms-monthly-cash-plan.component';
import { BmsBudgetPlanReviewInvestmentComponent } from './bms-budget-plan-review/bms-tab-child/bms-budget-plan-review-investment/bms-budget-plan-review-investment.component';
import { BmsBudgetPlanReviewExpenseComponent } from './bms-budget-plan-review/bms-tab-child/bms-budget-plan-review-expense/bms-budget-plan-review-expense.component';
import { BmsBudgetPlanReviewComponent } from './bms-budget-plan-review/bms-budget-plan-review.component';

const tabcode_component_dict = {
     [TABS.BMS_BUDGET_REVIEW]: BmsBudgetReviewComponent, 
     [TABS.BMS_BUDGET_PLAN_REVIEW]: BmsBudgetPlanReviewComponent, 
};

@NgModule({
  declarations: [
    BmsBudgetReviewComponent,
    BmsMonthlyBudgetPlanComponent,
    BmsMonthlyCashPlanComponent,
    BmsBudgetPlanReviewInvestmentComponent,
    BmsBudgetPlanReviewExpenseComponent,
    BmsBudgetPlanReviewComponent
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
export class BmsBudgetReviewModule {
  static getComponent(tabCode: string) {
    return tabcode_component_dict[tabCode];
  }
}
