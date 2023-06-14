using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.Segment2.Dto
{
    public class InputSegment2Dto
    {
        public long Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public long ProjectTypeId { get; set; }
        public long PeriodId { get; set; }
        public string Description { get; set; }
    }
}
