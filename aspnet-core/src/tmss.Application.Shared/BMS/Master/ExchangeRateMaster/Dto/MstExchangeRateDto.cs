using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.ExchangeRateMaster.Dto
{
    public class MstExchangeRateDto
    {
        public long Id { get; set; }
        public string PeriodVersionName { get; set; }
        public string PeriodName { get; set; }
        public string CurrencyName { get; set; }
        public int ExchangeRate { get; set; }
        public string Description { get; set; }
    }
}
