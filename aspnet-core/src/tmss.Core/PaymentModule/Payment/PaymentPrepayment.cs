using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Castle.MicroKernel.SubSystems.Conversion;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PaymentModule.Payment
{
    public class PaymentPrepayment : FullAuditedEntity<long>, IEntity<long>
    {
        public string PoNo { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? Amount { get; set; }
        public DateTime? AdvancedDate { get; set; }
        public bool IsPaymentAdded { get; set; }
        public long? PaymentId { get; set; }
        public long? PoHeaderId { get; set; }
        public bool IsAppliedInvoice { get; set; }
        public long? InvoiceId { get; set; }
        public long? PaymentHeaderId { get; set; }
        
    }
}
