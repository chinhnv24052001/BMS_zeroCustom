using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master.BMS.Department
{
    public class BmsMstTeam : FullAuditedEntity<long>, IEntity<long>
    {
        public string TeamName { get; set; }
        public long DepartmentId { get; set; }
        public long SectionId { get; set; }
        public long PeriodId { get; set; }
        public string Description { get; set; }
    }
}
