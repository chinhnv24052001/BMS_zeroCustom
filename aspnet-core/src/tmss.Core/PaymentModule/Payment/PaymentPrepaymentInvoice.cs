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
    public class PaymentPrepaymentInvoice : FullAuditedEntity<long>, IEntity<long>
    {
        public long InvoiceId { get; set; }
        public long PrepaymentId { get; set; }
        public long? PaymentRequestId { get; set; }
        
    }
}
