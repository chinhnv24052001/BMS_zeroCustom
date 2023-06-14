using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.Status
{
    public class BmsMstStatus : FullAuditedEntity<long>, IEntity<long>
    {
        public long StatusId { get; set; }
        public string StatusName { get; set; }
    }
}
