using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.RequestApproval.Dto
{
    public class ApprovalUserDto
    {
        public long Id { get; set; }
        public Guid? HrOrgStructureId { get; set; }
        public string ApprovalEmail { get; set; }
    }
}
