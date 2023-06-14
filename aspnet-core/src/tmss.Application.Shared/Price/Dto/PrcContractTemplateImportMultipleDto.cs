using System.Collections.Generic;

namespace tmss.Price.Dto
{
    public class PrcContractTemplateImportMultipleDto
    {
        public List<PrcContractTemplateDto> listContract { get; set; }
        public List<PrcContractTemplateImportDto> listItems { get; set; }
    }
}
