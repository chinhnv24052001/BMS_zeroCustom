using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonGetGlExchangeRateDto
    {
        public long Id { get; set; }
        public string FromCurrency { get; set; }
        public string ToCurrency { get; set; }
        public DateTime? ConversionDate { get; set; }
        public string ConversionType { get; set; }
        public double? ConversionRate { get; set; }
    }
}
