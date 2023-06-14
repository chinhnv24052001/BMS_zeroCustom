using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.ProjectCode12
{
    public class BmsMstProjectCode12 : FullAuditedEntity<long>, IEntity<long>
    {
        public long PeriodVersionId { get; set; }
        public long PeriodId { get; set; }
        public long Segment1Id { get; set; }
        public long Segment2Id { get; set; }
        public string CodeProject { get; set; }

    }
}
