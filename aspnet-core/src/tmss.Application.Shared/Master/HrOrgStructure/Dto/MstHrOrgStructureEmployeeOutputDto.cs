using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.HrOrgStructure.Dto
{
    public class MstHrOrgStructureEmployeeOutputDto
    {
        public long Id { get; set; }
        public string EmployeeName { get; set; }
        public Guid? HrOrgStructureId { get; set; }
    }
}
