using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.Currency.Dto
{
    public class InputSearchMstCurrency: PagedAndSortedInputDto
    {
        public string CurrencyCode { get; set; }
        public string Name { get; set; }
    }
}
