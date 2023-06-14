using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.Master.Segment5.Dto
{
    public class SearchSegment5Dto : PagedAndSortedInputDto
    {
        public long PeriodId { get; set; }
        public string Name { get; set; }
        public string Code { get; set; }
    }
}
