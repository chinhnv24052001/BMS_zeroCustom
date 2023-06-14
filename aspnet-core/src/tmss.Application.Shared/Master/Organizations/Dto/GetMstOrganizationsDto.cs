using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Organizations.Dto
{
    public class GetMstOrganizationsDto
    {
        public long Id { get; set; }
        public string Language { get; set; }
        public string SourceLang { get; set; }
        public string Name { get; set; }
        public string OrganizationCode { get; set; }
        public DateTime? UserDefinitionEnableDate { get; set; }
        public DateTime? DisableDate { get; set; }
        public long OperatingUnit { get; set; }
    }
}
