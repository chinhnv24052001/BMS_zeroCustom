using System;
using System.Collections.Generic;
using System.Text;
using tmss.BMS.Master.Segment1.Dto;
using tmss.BMS.Master.Segment2.Dto;

namespace tmss.BMS.Master.ProjectCode.Dto
{
    public class SaveMultipleProjectCodeDto
    {
        public long PeriodVersionId { get; set; }
        public long PeriodId { get; set; }
        public List<MstSegment1Dto> ListSegment1Id { get; set; }
        public List<MstSegment2Dto> ListSegment2Id { get; set; }
    }
}
