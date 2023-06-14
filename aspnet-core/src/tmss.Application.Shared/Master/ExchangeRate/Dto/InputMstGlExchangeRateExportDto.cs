using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.ExchangeRate.Dto
{
    public class InputMstGlExchangeRateExportDto
    {
        public long? CurrencyId { get; set; }
        public long? ToCurrencyId { get; set; }
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
    }
}
