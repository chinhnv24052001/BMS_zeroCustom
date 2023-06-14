using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.BudgetPIC.Dto
{
    public class SearchBudgetTransferDto: PagedAndSortedInputDto
    {
        public long PeriodId { get; set; }
        public long PeriodVersionId { get; set; }
        public int TabKey { get; set; }
    }
}
