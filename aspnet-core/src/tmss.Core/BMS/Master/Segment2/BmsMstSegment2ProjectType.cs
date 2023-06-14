using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.Segment2
{
    public class BmsMstSegment2ProjectType : FullAuditedEntity<long>, IEntity<long>
    {
        public string ProjectTypeName { get; set; }
        public string Description { get; set; }
    }
}
