using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstInventoryItemSubInventories : FullAuditedEntity<long>, IEntity<long>
    {
        public long InventoryItemId { set; get; }
        public long OrganizationId { set; get; }
        public string SubInventory { set; get; }
    }
}
