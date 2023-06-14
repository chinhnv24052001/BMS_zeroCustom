using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.RequestApproval
{
    public class RequestApprovalStepUser : FullAuditedEntity<long>, IEntity<long>
    {
        public long RequestApprovalStepId { get; set; }
        public long ApprovalUserId { get; set; }
        public DateTime? ApprovalDate { get; set; }
        public DateTime? RejectDate { get; set; }
        public DateTime? DeadlineDate { get; set; }
        public DateTime? OriginalDeadlineDate { get; set; }

        public Guid? ApprovalHrOrgStructureId { get; set; }
        public string ApprovalEmail { get; set; }
    }
}
