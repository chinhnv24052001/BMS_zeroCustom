using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Price.Dto
{
    public class PrcContractTemplateInsertOutputDto
    {
        public long? ContractId { get; set; }
        public List<long?> AppendixId { get; set; }
    }
}
