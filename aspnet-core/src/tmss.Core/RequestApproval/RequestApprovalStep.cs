using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.RequestApproval
{
    public enum ApprvalStatus
    {
        Approved,Rejected,Waitting,Pending
    }
    public class RequestApprovalStep : FullAuditedEntity<long>, IEntity<long>
    {
        public long ProcessTypeId { get; set; }
        public string ProcessTypeCode { get; set; }
        public long ReqId { get; set; }
        public long? ApprovalTreeDetailId { get; set; }
        public long ApprovalSeq { get; set; }
        public string ApprovalStatus { get; set; }
        public long ApprovalUserId { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public DateTime? RejectDate { get; set; }
        public Guid? ApprovalHrOrgStructureId { get; set; }

        public string ApprovalEmail { get; set; }
        public DateTime? RequestDate { get; set; }

        public DateTime? DeadlineDate { get; set; }

        public long? DayOfProcess { get; set; } 
        public string Note { get; set; }
        public string DepartmentName { get; set; }
        public string RequestNote { get; set; }
        public string ReplyNote { get; set; }
    }
}
