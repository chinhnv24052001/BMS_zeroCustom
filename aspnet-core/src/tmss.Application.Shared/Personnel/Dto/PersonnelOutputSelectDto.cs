using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Personnel.Dto
{
    public class PersonnelOutputSelectDto
    {
        public long Id { get; set; }
        public string EmailAddress { get; set; }
        public string Name { get; set; }
        public string EmployeesCode { get; set; }
        public string Title { get; set; }
        public string Position { get; set; }
        public string Status { get; set; }

    }
}
