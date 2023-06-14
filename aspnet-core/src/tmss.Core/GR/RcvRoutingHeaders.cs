using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.GR
{
    public class RcvRoutingHeaders : FullAuditedEntity<long>, IEntity<long>
    {
        public string RoutingName { get; set; }
        public string Description { get; set; }
    }
}
