using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.BudgetPlan
{
    public class BmsBudgetPlanDetail : FullAuditedEntity<long>, IEntity<long>
    {
        public long? GroupId { get; set; }
        public long? DivisionId { get; set; }
        public long? DepartmentId { get; set; }
        public long? CategoryId { get; set; }
        public long? ExpenseTypeId { get; set; }
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
        public long? CarModelId { get; set; }
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
    }
}
