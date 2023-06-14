using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.ContractTemplate.Dto
{
    public class InputContractTemplateDto
    {
        public long Id { get; set; }
        public string TemplateCode { get; set; }
        public string TemplateName { get; set; }
        public long InventoryGroupId { get; set; }
        public string IsActive { get; set; }
        public string AttachmentFileName { get; set; }
        public string RootPath { get; set; }
        public string Description { get; set; }
    }
}
