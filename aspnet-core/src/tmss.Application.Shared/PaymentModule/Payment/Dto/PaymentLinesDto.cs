using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.Payment.Dto
{
    public class PaymentLinesDto
    {
        public long? Id { get; set; }
        public long? PaymentHeaderId { get; set; }
        public decimal? PaymentAmount { get; set; }
        public long? InvoiceId { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string InvoiceNumber { get; set; }
        public decimal? InvoiceAmount { get; set; }
    }
}
