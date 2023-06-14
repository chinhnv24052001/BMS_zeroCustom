using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.ApprovalTree.Dto
{
    public class ApprovalTreeDetailOutputSelectDto
    {
        public long Id { get; set; }
        public long ApprovalTreeId { get; set; }
        public string ApprovalTypeName { get; set; }
        public string HrOrgStructureName { get; set; }
        public string TitleName { get; set; }
    }
}
