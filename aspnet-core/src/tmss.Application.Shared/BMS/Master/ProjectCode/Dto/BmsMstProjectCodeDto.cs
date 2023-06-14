using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.ProjectCode.Dto
{
    public class BmsMstProjectCodeDto
    {
        public long Id { get; set; }
        public string PeriodVersionName { get; set; }
        public string PeriodName { get; set; }
        public string Segment1Name { get; set; }
        public string Segment2Name { get; set; }
        public string CodeProject { get; set; }
    }
}
