using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Price.Dto
{
    public class PrcContractTemplateInsertDto
    {
        public string p_appendix_no { get; set; }
        public PrcContractTemplateDto dto { get; set; }
        public List<PrcAppendixContractDto> listAppendix { get; set; }
        public List<PrcContractTemplateImportDto> listItems { get; set; }
    }
}
