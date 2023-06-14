using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstPosition : FullAuditedEntity<long>, IEntity<long>
    {
        public string PositionName { get; set; }
        public string PositionCode { get; set; }
        public Guid MappingId { get; set; }
        public bool IsActive { get; set; }

    }
}
