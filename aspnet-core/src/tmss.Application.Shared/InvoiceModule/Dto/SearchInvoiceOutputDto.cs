using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace tmss.InvoiceModule.Dto
{
    public class SearchInvoiceOutputDto
    { 
        public long? Id { get; set; }
        public string InvoiceNum { get; set; }
        public string InvoiceSymbol { get; set; }
        public string VendorNumber { get; set; }
        public string VendorName { get; set; }
        public long? VendorSiteId { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public string InvoiceDateStr { get; set; }
        public string TaxName { get; set; }
        public decimal? TaxRate { get; set; }
        public string TaxRateStr { get; set; }
        public string CurrencyCode { get; set; }
        public decimal? Rate { get; set; }
        public string RateStr { get; set; }
        public string MatchingStatusText { get; set; }
        public string ConfirmStatusText { get; set; }
        public decimal? TotalAmount { get; set; }
        public string TotalAmountStr { get; set; }
        public decimal? TotalTaxAmount { get; set; }
        public long? VendorId { get; set; }
        public long? CurrencyId { get; set; }
        public string Description { get; set; }
        [StringLength(255)]
        public string VatRegistrationNum { get; set; }
        [StringLength(255)]
        public string VatRegistrationInvoice { get; set; }
        public List<SearchInvoiceOutputDetailDto> InvoiceDetailList { get; set; }

        public int? TotalCount;
        public decimal? TotalPaymentAmount { get; set; }
        public bool IsPaid { get; set; }
        public string ERROR_DESCRIPTION { get; set; }
        public float? InvoiceAmountPO { get; set; }
        [StringLength(30)]
        public string Status { get; set; }
        [StringLength(15)]
        public string Source { get; set; }
        [StringLength(50)]
        public string LookupCode { get; set; }
        [StringLength(500)]
        public string LookupLink { get; set; }
        [StringLength(20)]
        public string PoNumber { get; set; }
        public bool CheckMatched { get; set; }
        public string PicInvoice { get; set; }
        public decimal? VatAmount { get; set; }
    }
}
