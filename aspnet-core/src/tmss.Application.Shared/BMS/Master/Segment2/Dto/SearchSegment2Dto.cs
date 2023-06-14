using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.Master.Segment2.Dto
{
    public class SearchSegment2Dto : PagedAndSortedInputDto
    {
        public long PeriodId { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }
}
