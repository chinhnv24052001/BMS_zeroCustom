using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Personnel.Dto
{
    public class MstHrOrgStructureInputSearchDto: PagedAndSortedInputDto
    {
        public string Name { get; set; }
        public string PersionalName { get; set; }
    }
}
