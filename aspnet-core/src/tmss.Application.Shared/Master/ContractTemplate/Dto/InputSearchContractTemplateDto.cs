using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.ContractTemplate.Dto
{
    public class InputSearchContractTemplateDto : PagedAndSortedInputDto
    {
        public string Keyword { get; set; }
    }
}
