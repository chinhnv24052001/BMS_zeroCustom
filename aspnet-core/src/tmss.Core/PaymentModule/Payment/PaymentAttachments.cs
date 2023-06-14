using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PaymentModule.Payment
{
    public class PaymentAttachments : FullAuditedEntity<long>, IEntity<long>
    {
        public long PaymentHeaderId { get; set; }
        public string ServerFileName { get; set; }
        public string ServerLink { get; set; }
        public string ContentType { get; set; }

    }
}
