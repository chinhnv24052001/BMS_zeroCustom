using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.BudgetReview.Dto
{
    public class BmsBudgetPlanReviewDto
    {
        //Thieu
        public long Id { get; set; }
        public string Group { get; set; }
        public string Division { get; set; }
        public string Department { get; set; }
        public string Category { get; set; }
        public string ExpenseType { get; set; }
        public string BudgetName { get; set; }
        public string BudgetCode { get; set; }
        public int? Month { get; set; }
        public int? Year { get; set; }
        public double? Jan_PlanAmount { get; set; }
        public double? Feb_PlanAmount { get; set; }
        public double? Mar_PlanAmount { get; set; }
        public double? Apr_PlanAmount { get; set; }
        public double? May_PlanAmount { get; set; }
        public double? Jun_PlanAmount { get; set; }
        public double? Jul_PlanAmount { get; set; }
        public double? Aug_PlanAmount { get; set; }
        public double? Sep_PlanAmount { get; set; }
        public double? Oct_PlanAmount { get; set; }
        public double? Nov_PlanAmount { get; set; }
        public double? Dec_PlanAmount { get; set; }

        public long? BudgetPlanId { get; set; }
        public string CarModel { get; set; }
        public long? PeriodId { get; set; }
        public string RemarkOri { get; set; }
        public string Remark1Q { get; set; }
        public string Remark2Q { get; set; }
        public string Remark3Q { get; set; }
        public string RemarkFP { get; set; }
        public string Remark11P { get; set; }
        public double? FY_Ori { get; set; }
        public double? FY_1Q { get; set; }
        public double? FY_2Q { get; set; }
        public double? FY_3Q { get; set; }
        public double? FY_11P { get; set; }

        public long? CurrencyCode { get; set; }
        public long? FinPlan { get; set; }
        public DateTime? PrRingiIssueMonth { get; set; }
        public DateTime? CompletionMonth { get; set; }
        public DateTime? SaleDLRMonth { get; set; }
        public string TmcCode { get; set; }
        public string TmcCategoryName { get; set; }
        public string AssetClass { get; set; }
        public string Pp06 { get; set; }
        public string InvestType { get; set; }
        public string ProjectNonProject { get; set; }
        public string ProjectCode { get; set; }
        public string PlNumber { get; set; }
    }
}
