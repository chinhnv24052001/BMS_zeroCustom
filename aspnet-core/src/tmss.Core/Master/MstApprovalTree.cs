using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstApprovalTree : FullAuditedEntity<long>, IEntity<long>
    {
        public long ProcessTypeId { get; set; }
        public long CurrencyId { get; set; }
        public decimal AmountFrom { get; set; }
        public decimal AmountTo { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public long InventoryGroupId { get; set; }
        

    }
}
