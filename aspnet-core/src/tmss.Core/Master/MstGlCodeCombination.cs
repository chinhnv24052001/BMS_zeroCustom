using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using Stripe;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstGlCodeCombination : FullAuditedEntity<long>, IEntity<long>
    {
        public long? ChartOfAccountsId { get; set; }
        public string AccountType { get; set; }
        public string EnabledFlag { get; set; }
        public string Segment1 { get; set; }
        public string Segment2 { get; set; }
        public string Segment3 { get; set; }
        public string Segment4 { get; set; }
        public string Segment5 { get; set; }
        public string Segment6 { get; set; }
        public string ConcatenatedSegments { get; set; }

    }
}
