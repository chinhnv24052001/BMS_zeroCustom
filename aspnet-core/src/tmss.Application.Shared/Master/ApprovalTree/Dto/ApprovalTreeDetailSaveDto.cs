using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.ApprovalTree.Dto
{
    public class ApprovalTreeDetailSaveDto
    {
        public long Id { get; set; }
        public long ApprovalTreeId { get; set; }
        public long ApprovalTypeId { get; set; }
        public string HrOrgStructureId { get; set; }
        public List<long> ListUserId { get; set; }
        public long? TitleId { get; set; }
        public long? ApprovalSeq { get; set; }
        public long? DayOfProcess { get; set; }
        public long? PositionId { get; set; }
    }
}
