
using System.Collections.Generic;


namespace tmss.Price.Dto
{
    public class PrcAppendixContractInsertDto
    {   
        public bool isInsertIttems { get; set; }
        public PrcAppendixContractDto dtoAppendix { get; set; }
        public List<PrcContractTemplateImportDto> listItems { get; set; }
    }
}
