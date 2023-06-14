using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.Segment4.Dto 
{
    public class InputSegment4Dto
    {
        public long Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public long GroupSeg4Id { get; set; }
        public long PeriodId { get; set; }
        public string Description { get; set; }
    }
}
