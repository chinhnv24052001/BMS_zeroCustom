using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.ExchangeRateMaster
{
    public class BmsMstExchangeRate : FullAuditedEntity<long>, IEntity<long>
    {
        public long PeriodVersionId { get; set; }
        public long PeriodId { get; set; }
        public long CurrencyId { get; set; }
        public int ExchangeRate { get; set; }
        public string Description { get; set; }
    }
}
