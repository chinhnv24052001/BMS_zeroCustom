using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.RequestApproval.Dto
{
    public class RequestNextApprovalInputDto
    {
        public long ReqId { get; set; }
        public string ProcessTypeCode { get; set; }
        public long ApprovalTreeId { get; set; }

    }
}
