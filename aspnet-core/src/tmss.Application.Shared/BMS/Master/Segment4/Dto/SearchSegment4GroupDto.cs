using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.Master.Segment4.Dto
{
    public class SearchSegment4GroupDto : PagedAndSortedInputDto
    {
        public string GroupName { get; set; }
        public long PeriodId { get; set; }
    }
}

