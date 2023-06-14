using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.Period
{
    public class BmsMstVersion : FullAuditedEntity<long>, IEntity<long>
    {
        public string VersionName { get; set; }
        public int FromMonth { get; set; }
        public int ToMonth { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }
}
