using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.InvoiceAdjusted.Dto
{
    public class GetListInvoiceLinesDto
    {
        public long Id { get; set; }
        public long InvoiceId { get; set; }
        public long? LineNum { get; set; }
        public string PoNumber { get; set; }
        public string VendorName { get; set; }
        public long? VendorId { get; set; }
        public long? ItemId { get; set; }
        public string ItemDescription { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? Amount { get; set; }
        public decimal? TaxRate { get; set; }
        public decimal? Vat { get; set; }
    }
}
