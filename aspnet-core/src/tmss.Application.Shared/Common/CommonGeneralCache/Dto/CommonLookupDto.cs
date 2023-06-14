using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonLookupDto
    {
        public long Id { get; set; }
        public string LookupCode { get; set; }
        public string LookupType { get; set; }
        public string DisplayedField { get; set; }
        public string Description { get; set; }
    }
}
