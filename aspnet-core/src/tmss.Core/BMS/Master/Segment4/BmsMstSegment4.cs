using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.Segment4 
{
    public class BmsMstSegment4 : FullAuditedEntity<long>, IEntity<long>
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public long GroupSeg4Id { get; set; }
        public long PeriodId { get; set; }
        public string Description { get; set; }
    }
}
