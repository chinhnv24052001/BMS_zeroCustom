using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.Segment5.Dto
{
    public class InputSegment5Dto
    {
        public long Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public long PeriodId { get; set; }
        public string Description { get; set; }
    }
}
