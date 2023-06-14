using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.RequestApproval.Dto
{
    public class CreateRequestApprovalOutputDto
    {
        public bool Result { get; set; }
        public string Message { get; set; }
        public long ApprovalTreeId { get; set; }
    }
}
