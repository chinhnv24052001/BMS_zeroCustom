using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Currency.Dto
{
    public class MstCurrencyDto
    {
        public long Id { get; set; }
        public string CurrencyCode { get; set; }
        public string Name { get; set; }
        public string DescriptionEnglish { get; set; }
        public string DescriptionVetNamese { get; set; }
        public string Status { get; set; }
    }
}
