using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.Segment1.Dto
{
    public class InputSegment1Dto
    {
        public long Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public long TypeCostId { get; set; }
        public long PeriodId { get; set; }
        public string Description { get; set; }
    }
}
