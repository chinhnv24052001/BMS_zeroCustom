using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PaymentModule.Payment
{
    [Table("PaymentLines")]
    public partial class PaymentLines : FullAuditedEntity<long>, IEntity<long>
    {
        public long? PaymentHeaderId { get; set; }
        public decimal? PaymentAmount { get; set; }
        public long? InvoiceId { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public string InvoiceNumber { get; set; }
        public decimal? InvoiceAmount { get; set; }
        public decimal? PrepaymentAmount { get; set; }
        public bool IsAdjustmentInvoice { get; set; }
        public string PoNo { get; set; }
        public long? AddedPrepaymentId { get; set; }
        
    }
}
