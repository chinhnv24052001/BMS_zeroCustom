using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.Master.ExchangeRateMaster.Dto
{
    public class SearchExchangeRateDto : PagedAndSortedInputDto
    {
        public long CurrencyId { get; set; }
        public long PeriodId { get; set; }
    }
}
