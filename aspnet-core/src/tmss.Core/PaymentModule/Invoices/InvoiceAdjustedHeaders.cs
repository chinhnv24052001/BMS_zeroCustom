using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PaymentModule.Invoices
{
    public class InvoiceAdjustedHeaders : FullAuditedEntity<long>, IEntity<long>
    {

        public string InvoiceNo { get; set; }
        public string SerialNo {get; set; }
        public DateTime? InvoiceDate {get; set; }
        public long? SupplierId {get; set; }
        public string InvoiceNoAdjusted {get; set; }
        public string SerialNoAdjusted {get; set; }
        public DateTime? InvoiceDateAdjusted {get; set; }
        public string TypeAdjusted {get; set; }
        public string Description {get; set; }

    }
}
