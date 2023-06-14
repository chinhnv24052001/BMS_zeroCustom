using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.Segment1
{
    public class BmsMstSegment1 : FullAuditedEntity<long>, IEntity<long>
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public long TypeCostId { get; set; }
        public long PeriodId { get; set; }
        public string Description { get; set; }
    }
}
