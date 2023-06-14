using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Personnel.Dto
{
    public class MstHrOrgStructureOutputSelectDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string OrgStructureTypeName { get; set; }
        public string OrgStructureTypeCode { get; set; }
    }
}
