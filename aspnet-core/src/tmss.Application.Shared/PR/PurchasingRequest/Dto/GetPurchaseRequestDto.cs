using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class GetPurchaseRequestDto
    {
        public long Id { get; set; }
        public string PreparerName { get; set; }
        public string RequisitionNo { get; set; }
        public string AuthorizationStatus { get; set; }
        public string Description { get; set; }
        public string DepartmentApprovalName { get; set; }
        public string ProductGroupName { get; set; }
        public string RequestNote { get; set; }
        public string ReplyNote { get; set; }
        public string Status { get; set; }
        public long TotalPrice { get; set; }
        public long? CreatorUserId { get; set; }
        public DateTime CreationTime { get; set; }
        public string Currency { get; set; }
        public long TotalCount { get; set; }
    } 
}
