using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master.BMS.Department
{
    public class BmsMstDivision : FullAuditedEntity<long>, IEntity<long>
    {
        public long GroupId { get; set; }
        public string DivisionName { get; set; }
        public string ShortName { get; set; }
        public long PeriodId { get; set; }
        public string Description { get; set; }
    }
}
