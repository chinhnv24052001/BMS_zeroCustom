using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.RequestApproval.Dto
{
    public class ApproveOrRejectInputDto
    {
        public long RequestApprovalStepId { get; set; }
        public long ReqId { get; set; }
        public string ProcessTypeCode { get; set; }
        public string Note { get; set; }
        public long ApprovalUserId { get; set; }
        public bool IsApproved { get; set; }
        public string CreateSupplierAccountUrl{ get; set; }
    }
}
