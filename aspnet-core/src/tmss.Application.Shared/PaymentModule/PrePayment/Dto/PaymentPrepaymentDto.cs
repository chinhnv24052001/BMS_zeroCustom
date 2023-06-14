using Castle.MicroKernel.SubSystems.Conversion;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Prepayment.Dto
{
    public class PaymentPrepaymentDto
    {
        public long Id { get; set; }
        public string PoNo { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public decimal? Amount { get; set; }
        public DateTime? AdvancedDate { get; set; }
        public bool IsPaymentAdded { get; set; }
        public bool IsAppliedInvoice { get; set; }
        public string SupplierName { get; set; }
        public long? PoHeaderId { get; set; }

        public string InvoiceNum { get; set; }
        public DateTime? InvoiceDate { get; set; }

        public long? PaymentId { get; set; }
        public string PaymentNo { get; set; }
        public DateTime? PaymentRequestDate { get; set; }

    }
}
