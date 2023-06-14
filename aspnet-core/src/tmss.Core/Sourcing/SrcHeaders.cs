using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.GR
{
    public class SrcHeader : FullAuditedEntity<long>, IEntity<long>
    {
        public string SourcingCode { get; set; }
        public string SourcingName { get; set; }
        public long? InventoryGroupId { get; set; }
        public DateTime? EffectiveFromDate { get; set; }
        public DateTime? EffectiveToDate { get; set; }
        public string Status { get; set; }
        public double TotalAmout { get; set; }

    }
}
