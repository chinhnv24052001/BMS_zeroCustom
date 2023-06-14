using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Payment.Dto
{
    public class InputPaymentLinesDto
    {
        public long? Id { get; set; }
        public long? PaymentHeaderId { get; set; }
        public decimal? PaymentAmount { get; set; }
        public long? InvoiceId { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public string InvoiceNumber { get; set; }
        public decimal? InvoiceAmount { get; set; }
        public decimal? PrepaymentAmount { get; set; }
        public bool IsAdjustmentInvoice { get; set; }
        public string PoNo { get; set; }
        public long? AddedPrepaymentId { get; set; }
        public decimal? AmountVat { get; set; }
    }
}
