using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.ContractTemplate.Dto
{
    public class GetContractTemplateDto
    {
        public long Id { get; set; }
        public string TemplateCode { get; set; }
        public string TemplateName { get; set; }
        public string InventoryGroupName { get; set; }
        public string IsActive { get; set; }
        public long TotalCount { get; set; }
        public string Attachments { get; set; }
        public string Description { get; set; }

    }
}
