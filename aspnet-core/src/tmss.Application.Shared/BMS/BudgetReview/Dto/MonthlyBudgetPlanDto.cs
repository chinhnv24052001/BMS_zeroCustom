using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.BudgetReview.Dto
{
    public class MonthlyBudgetPlanDto
    {
        public long Id { get; set; }
        public string Group { get; set; }
        public string division { get; set; }
        public string department { get; set; }
        public string budgetCode { get; set; }
        public string activitiesName { get; set; }
        public float planTotal { get; set; }
        public string aprilPlan { get; set; }
        public float aprilActual { get; set; }
        public string mayPlan { get; set; }
        public float mayActual { get; set; }
        public string junePlan { get; set; }
        public float juneActual { get; set; }
        public string julyPlan { get; set; }
        public float julyActual { get; set; }
        public string augustPlan { get; set; }
        public float augustActual { get; set; }
        public string septemberPlan { get; set; }
        public float septemberActual { get; set; }
        public string octoberPlan { get; set; }
        public float octoberActual { get; set; }
        public string novemberPlan { get; set; }
        public float novemberActual { get; set; }
        public string decemberPlan { get; set; }
        public float decemberActual { get; set; }
        public string januaryPlan { get; set; }
        public float januaryActual { get; set; }
        public string februaryPlan { get; set; }
        public float februaryActual { get; set; }
        public string marchPlan { get; set; }
        public float marchActual { get; set; }
        public string budgetReview { get; set; }
        public string transferAddOn { get; set; }
        public float actualSummary { get; set; }
        public string nonPurchaseSummary { get; set; }
        public string encumbrance { get; set; }
        public string nonPurchaseEncumbrance { get; set; }
        public string remaining { get; set; }
        public string deptCheck { get; set; }
        public string deptRemark { get; set; }
        public string groupCheck { get; set; }
        public string groupRemark { get; set; }
        public string finRemark { get; set; }
        public string type { get; set; }
        public string category { get; set; }
        public string expenseType { get; set; }
        public string carModel { get; set; }
        public string projectAndDate { get; set; }
        public string plCode { get; set; }
        public string remarkDetail { get; set; }
        public string status { get; set; }

        public string tmcCode { get; set; }
        public string tmcCategoryName { get; set; }
        public string projectName { get; set; }
        public string projectCode { get; set; }
        public string priority { get; set; }
        public string asset { get; set; }
        public string pp06 { get; set; }
    }
}
