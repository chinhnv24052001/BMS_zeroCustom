using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.Segment1
{
    public class BmsMstSegment1TypeCost : FullAuditedEntity<long>, IEntity<long>
    {
        public string TypeCostName { get; set; }
        public string Description { get; set; }
    }
}
