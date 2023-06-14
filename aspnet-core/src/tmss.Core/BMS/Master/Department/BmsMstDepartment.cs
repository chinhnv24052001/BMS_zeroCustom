using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master.BMS.Department
{
    public class BmsMstDepartment : FullAuditedEntity<long>, IEntity<long>
    {
        public long DivisionId { get; set; }
        public string DepartmentName { get; set; }
        public long PeriodId { get; set; }
        public string Description { get; set; }
    }
}
