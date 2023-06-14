using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.Payment.Dto
{
    public class GetPrepaymentDto
    {
        public bool Checked { get; set; }
        public long Id { get; set; }
        public string PoNo { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public decimal? Amount { get; set; }
        public DateTime? AdvancedDate { get; set; }
        public bool IsPaymentAdded { get; set; }
        public long? PaymentId { get; set; }
        public string PaymentNo { get; set; }
        public DateTime? PaymentRequestDate { get; set; }
        public string SupplierName { get; set; }
        public long? PoHeaderId { get; set; }
        public long? InvoiceId { get; set; }
    }
}
