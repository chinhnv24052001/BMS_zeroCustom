using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstCatalog: FullAuditedEntity<long>, IEntity<long>
    {
        public long? InventoryGroupId { get; set; }
        public string CatalogCode { get; set; }
        public string CatalogName { get; set; }
        public bool IsActive { get; set; }

    }
}
