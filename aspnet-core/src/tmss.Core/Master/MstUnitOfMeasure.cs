using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstUnitOfMeasure : FullAuditedEntity<long>, IEntity<long>
    {
        public string UnitOfMeasure { get; set; }
        public string UOMCode { get; set; }
        public string UOMClass { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
    }
}

