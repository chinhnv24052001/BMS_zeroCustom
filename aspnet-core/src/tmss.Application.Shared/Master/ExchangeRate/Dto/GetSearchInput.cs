using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.ExchangeRate.Dto
{
    public class GetSearchInput : PagedAndSortedInputDto
    {
        public long? CurrencyId { get; set; }
        public long? ToCurrencyId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
