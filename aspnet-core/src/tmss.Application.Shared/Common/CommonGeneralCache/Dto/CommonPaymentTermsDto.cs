using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonPaymentTermsDto
    {
        public long Id { get; set; }
        public string Name { get; set; }
        public bool EnableFlag { get; set; }
        public string Description { get; set; }
        public string Type { get; set; }
    }
}
