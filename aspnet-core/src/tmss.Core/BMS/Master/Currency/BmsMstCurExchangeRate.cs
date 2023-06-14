using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master.BMS.Currency
{
    public class BmsMstCurExchangeRate : FullAuditedEntity<long>, IEntity<long>
    {
        public long CurrencyId { get; set; }
        public double ExchangeRate { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime ToDate { get; set; }
    }
}
