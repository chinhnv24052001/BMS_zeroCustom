using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Invoices.Dto
{
    public class InvoiceHeadersDto : PagedAndSortedInputDto
    {
        public long Id { get; set; }
        public string InvoiceNum { get; set; }
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
        public bool IsPaid { get; set; } //paid in payment request 
    }
}
