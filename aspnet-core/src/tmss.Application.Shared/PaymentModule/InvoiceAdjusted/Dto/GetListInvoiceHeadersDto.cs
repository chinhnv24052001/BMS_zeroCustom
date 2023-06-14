using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.InvoiceAdjusted.Dto
{
    public class GetListInvoiceHeadersDto
    {
        public long Id { get; set; }
        public string InvoiceNo { get; set; }
        public string SerialNo { get; set; }
        public DateTime? InvoiceDate { get; set; }
    }
}
