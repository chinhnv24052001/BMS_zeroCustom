using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.BudgetReview.Dto
{
    public class SearchBudgetPlanReviewDto : PagedAndSortedInputDto
    {
        public long? periodId { get; set; }
        public long? periodVersionId { get; set; }
        public long? groupId { get; set; }
        public long? divId { get; set; }
        public long? depId { get; set; }
    }
}
