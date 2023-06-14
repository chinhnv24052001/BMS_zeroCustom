using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.InvoiceAdjusted.Dto
{
    public class GetAllInvoiceAdjustedDto
    {
        public long Id { get; set; }
        public string InvoiceNo { get; set; }
        public string TypeAdjusted { get; set; }
        public string SerialNo { get; set; }
        public string SupplierName { get; set; }
        public string VatAdjusted { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public string InvoiceNoAdjusted { get; set; }
        public string SerialNoAdjusted { get; set; }
        public long TotalCount { get; set; }
    }
}
