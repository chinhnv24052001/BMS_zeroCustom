using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Core.Master.BMS.Department
{
    public class BmsMstGroup : FullAuditedEntity<long>, IEntity<long>
    {
        public string GroupName { get; set; }
        public string ShortName { get; set; }
        public string Description { get; set; }
        public long PeriodId { get; set; }

    }
}
