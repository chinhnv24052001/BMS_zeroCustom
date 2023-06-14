using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstCategories : FullAuditedEntity<long>, IEntity<long>
    {
        public long StructureId { get; set; }
        public string Segment1 { get; set; }
        public string Segment2 { get; set; }
    }
}
