using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PaymentModule.Invoices
{
    public class InvoiceAdjustedLines : FullAuditedEntity<long>, IEntity<long>
    {

        public long? InvAdjustedHeadersId { get; set; }
        public long? OriginalInvoiceLineId { get; set; }
        public string TypeAdjusted { get; set; }
        public string ContentAdjusted { get; set; }
        public long? InvLineAdjusted { get; set; }
        public decimal? Quantity { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TotalPrice { get; set; }
        public int Tax { get; set; }
        public decimal? Vat { get; set; }
        public decimal? TotalPriceAdjusted { get; set; }

    }
}
