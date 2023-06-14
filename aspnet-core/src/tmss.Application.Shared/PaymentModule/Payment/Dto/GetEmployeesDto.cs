using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.Payment.Dto
{
    public class GetEmployeesDto
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public string UserName { get; set; }
        public string PosCode { get; set; }
        public string EmailAddress { get; set; }
        public string EmployeeCode { get; set; }
        public string TitleCode { get; set; }
        public string DeptName { get; set; }

        public string TitleDescription { get; set; }
        public Guid? HrOrgStructureId { get; set; }
        public Guid? ParentId { get; set; }
    }
}
