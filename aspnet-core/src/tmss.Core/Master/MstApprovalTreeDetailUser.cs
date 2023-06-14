using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstApprovalTreeDetailUser : FullAuditedEntity<long>, IEntity<long>
    {
        public long ApprovalTreeDetailId { get; set; }
        public long ApprovalUserId { get; set; }
    }
}
