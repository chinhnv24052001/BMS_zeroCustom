using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class InputGetGlExchangRateDto
    {
        public string FromCurrency { get; set; }
        public string ToCurrency { get; set; }
        public DateTime? ConversionDate { get; set; }
    }
}
