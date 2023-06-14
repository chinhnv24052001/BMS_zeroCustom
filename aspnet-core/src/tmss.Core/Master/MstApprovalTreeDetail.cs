using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstApprovalTreeDetail : FullAuditedEntity<long>, IEntity<long>
    {
        public long ApprovalTreeId { get; set; }
        public long ApprovalTypeId { get; set; }
        public Guid? HrOrgStructureId { get; set; } 
        public long? TitleId { get; set; }
        public long? PositionId { get; set; }
        public bool IsActive { get; set; }
        public long? ApprovalSeq { get; set; }
        public long? DayOfProcess { get; set; }
    }
}
