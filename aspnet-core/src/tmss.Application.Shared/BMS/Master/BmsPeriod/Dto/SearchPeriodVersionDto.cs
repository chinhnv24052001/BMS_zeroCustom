using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.Master.BmsPeriod.Dto
{
    public class SearchPeriodVersionDto : PagedAndSortedInputDto
    {
        public long PeriodId{ get; set; }
    }
}
