using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.RequestApproval.Dto
{
    public enum ProcessTypeCode
    {
        UR, PR, PO, PC
    }
    public class CreateRequestApprovalInputDto
    {
        public long ReqId { get; set; }
        public string ProcessTypeCode { get; set; }

         
    }
}
