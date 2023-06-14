using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.Master.Segment3.Dto
{
    public class SearchSegment3Dto : PagedAndSortedInputDto
    {
        public long PeriodId { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }
}
