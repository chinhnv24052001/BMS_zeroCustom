using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.InvoiceAdjusted.Dto
{
    public class InputInvoiceAdjustedHeadersDto
    {
        public long Id { get; set; }
        public string InvoiceNo { get; set; }
        public string SerialNo { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public long? SupplierId { get; set; }
        public string InvoiceNoAdjusted { get; set; }
        public string SerialNoAdjusted { get; set; }
        public DateTime? InvoiceDateAdjusted { get; set; }
        public string TypeAdjusted { get; set; }
        public string Description { get; set; }

        public List<InputInvoiceAdjustedLinesDto> inputInvoiceAdjustedLinesDtos { get; set; }
    }
}
