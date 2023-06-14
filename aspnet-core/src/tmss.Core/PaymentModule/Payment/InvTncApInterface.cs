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
    [Table("InvTncApInterface")]
    public partial class InvTncApInterface : FullAuditedEntity<long>, IEntity<long>
    {
        public DateTime InvoiceDate { get; set; }
        public string InvoiceNum { get; set; }
        public string Currency { get; set; }
        public decimal? Amount { get; set; }
        public string Description { get; set; }
        public string InvCategory { get; set; }
        public string SerialNo { get; set; }
        public string SupplierNo { get; set; }
        public string Site { get; set; }
        public long? BusinessUserId { get; set; }
        public string InvoiceSource { get; set; }
        public string SellerTaxCode { get; set; }
        public string PoNo { get; set; }
    }
}
