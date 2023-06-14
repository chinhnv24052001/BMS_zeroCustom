using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Price.Dto
{
    public class SearchInputDto
    {
        public string ContractNo { get; set; }
        public DateTime? EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }
        public long Page { get; set; }
        public long PageSize { get; set; }
    }
}
