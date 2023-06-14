using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstGlExchangeRate : FullAuditedEntity<long>, IEntity<long>
    {
        public string FromCurrency { get; set; }
        public string ToCurrency { get; set; }
        public DateTime? ConversionDate { get; set; }
        public string ConversionType { get; set; }
        public double? ConversionRate { get; set; }
        public string Status_Code { get; set; }

    }
}
