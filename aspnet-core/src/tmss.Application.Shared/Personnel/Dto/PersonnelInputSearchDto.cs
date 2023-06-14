using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Personnel.Dto
{
    public class PersonnelInputSearchDto: PagedAndSortedInputDto
    {
        public Guid? HrOrgStructureId { get; set; }
        public string Name { get; set; }

    }
}
