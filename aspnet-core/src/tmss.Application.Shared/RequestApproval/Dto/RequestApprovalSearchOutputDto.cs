using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.RequestApproval.Dto
{
    public class RequestApprovalSearchOutputDto
    {
        public long Id { get; set; }
        public long ReqId { get; set; }
        public long RequestApprovalStepId { get; set; }
        public string ProcessTypeCode { get; set; }
        public string ApprovalStatus { get; set; }
        public string RequestType { get; set; }
        public string RequestNo { get; set; }
        public string RequestPersonName { get; set; }
        public DateTime RequestDate { get; set; }
        public string Description { get; set; }
        public int TotalCount { get; set; }
        public string DepartmentApprovalName { get; set; }
        public string RequestNote { get; set; }
        public string ReplyNote { get; set; }
        public bool? IsBuyer { get; set; }
    }
}
