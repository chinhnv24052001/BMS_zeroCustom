using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Invoices.Dto
{
    public class InvoiceLinesDto : PagedAndSortedInputDto
    {
        public long Id { get; set; }
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
        public decimal? Amount { get; set; }
        public decimal? AmountVat { get; set; }
        public decimal? ForeignPrice { get; set; }
        public decimal? ForeignPriceVnd { get; set; }
        public string Flag { get; set; }
        public int? QuantityReceived { get; set; }
        public int? QuantityMatched { get; set; }
    }
}
