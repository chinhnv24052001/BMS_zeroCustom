using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.PaymentModule.Invoices
{
    [Table("InvoiceHeaders")]
    public partial class InvoiceHeaders : FullAuditedEntity<long>, IEntity<long>
    {
        public string InvoiceNum { get; set; }
        public string InvoiceSymbol { get; set; }
        public string Description { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public long? VendorId { get; set; }
        public string VendorName { get; set; }
        public string VendorNumber { get; set; }
        public long? VendorSiteId { get; set; }
        public string CurrencyCode { get; set; }
        public decimal? Rate { get; set; }
        public DateTime? RateDate { get; set; }
        public decimal? InvoiceAmount { get; set; }
        public decimal? AmountVat { get; set; }
        public long? TaxId { get; set; }
        public string TaxName { get; set; }
        public decimal? TaxRate { get; set; }
        public decimal? Differency { get; set; }
        public decimal? AmountDeducted { get; set; }
        public bool IsPaid { get; set; }
        public bool IsAdjustmentInvoice { get; set; }
        public long? AdjustmentForInvoiceId { get; set; }
        [StringLength(30)]
        public string Status { get; set; }
        [StringLength(15)]
        public string Source { get; set; }
        [StringLength(50)]
        public string LookupCode { get; set; }
        [StringLength(500)]
        public string LookupLink { get; set; }
        public DateTime? CancelDate { get; set; }
        [StringLength(500)]
        public string CancelReason { get; set; }
        public long? PicInvoiceUserId { get; set; }
        [StringLength(255)]
        public string PicInvoice { get; set; }
        [StringLength(255)]
        public string PicInvoiceEmailAddress { get; set; }
        [StringLength(255)]
        public string VatRegistrationInvoice { get; set; }
    }
}
