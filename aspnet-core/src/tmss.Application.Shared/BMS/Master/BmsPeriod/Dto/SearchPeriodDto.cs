using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.Master.BmsPeriod.Dto
{
    public class SearchPeriodDto : PagedAndSortedInputDto
    {
        public string PeriodName { get; set; }
        public int? PeriodYear { get; set; }
    }
}
