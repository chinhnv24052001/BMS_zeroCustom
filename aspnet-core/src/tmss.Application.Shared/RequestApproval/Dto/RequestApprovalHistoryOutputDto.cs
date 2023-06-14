using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.RequestApproval.Dto
{
    public class RequestApprovalHistoryOutputDto
    {
        public long Id { get; set; }
        public string ApprovalFullName{ get; set; }
        public string ApprovalStatus { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public DateTime? RequestDate { get; set; }
        public DateTime ? DeadlineDate { get; set; }
        public string Note { get; set; }
    }
}
