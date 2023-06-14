using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.ProjectCode.Dto
{
    public class InputProjectCodeDto
    {
        public long Id { get; set; }
        public long PeriodVersionId { get; set; }
        public long PeriodId { get; set; }
        public long Segment1Id { get; set; }
        public long Segment2Id { get; set; }
        public string CodeProject { get; set; }
    }
}
