using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.ExchangeRateMaster.Dto
{
    public class InputExchangeRateDto
    {
        public long Id { get; set; }
        public long PeriodVersionId { get; set; }
        public long PeriodId { get; set; }
        public long CurrencyId { get; set; }
        public int ExchangeRate { get; set; }
        public string Description { get; set; }
    }
}
