using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.PaymentModule.Invoices
{
    [Table("InvoiceLines")]
    public partial class InvoiceLines : FullAuditedEntity<long>, IEntity<long>
    {
        public long InvoiceId { get; set; }
        public long? LineNum { get; set; }
        public long? PoHeaderId { get; set; }
        public string PoNumber { get; set; }
        public long? VendorId { get; set; }
        public long? ItemId { get; set; }
        public string ItemNumber { get; set; }
        public string ItemDescription { get; set; }
        public long? CategoryId { get; set; }
        public int? Quantity { get; set; }
        public int? QuantityOrder { get; set; }
        public int? QuantityOnhand { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TaxRate { get; set; }
        public decimal? Amount { get; set; }
        public decimal? AmountVat { get; set; }
        public decimal? ForeignPrice { get; set; }
        public decimal? ForeignPriceVnd { get; set; }
        public string Flag { get; set; }
        public int? QuantityReceived { get; set; }
        public int? QuantityMatched { get; set; }
        [StringLength(255)]
        public string Note { get; set; }
    }
}
