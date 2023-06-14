using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.Segment5.Dto
{
    public class MstSegment5Dto
    {
        public long Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public bool IsActive { get; set; }
        public string PeriodName { get; set; }
        public string Description { get; set; }
    }
}
