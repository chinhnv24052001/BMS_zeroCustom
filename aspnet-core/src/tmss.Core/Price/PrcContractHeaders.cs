using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Price
{
    public class PrcContractHeaders : FullAuditedEntity<long>, IEntity<long>
    {
        public string ContractNo { get; set; }
        public DateTime? EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }

        public string Description { get; set; }
        public string ApprovalStatus { get; set; }
        public string SeqNo { get; set; }
        public string DepartmentApprovalName { get; set; }
    }
}
