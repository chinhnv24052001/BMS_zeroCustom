using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.Segment4
{
    public class BmsMstSegment4Group : FullAuditedEntity<long>, IEntity<long>
    {
        public string GroupName { get; set; }
        public long PeriodId { get; set; }
        public string Decription { get; set; }
    }
}
