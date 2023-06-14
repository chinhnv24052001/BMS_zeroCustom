using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.InvTncApInterface
{
    public class InvTncApInterfaceDto
    {
        public long Id { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string InvoiceNum { get; set; }
        public string Currency { get; set; }
        public decimal? Amount { get; set; }
        public string Description { get; set; }
        public string InvCategory { get; set; }
        public string SerialNo { get; set; }
        public string SupplierNo { get; set; }
        public string Site { get; set; }
        public long? BusinessUserId { get; set; }
        public string InvoiceSource { get; set; }
        public string SellerTaxCode { get; set; }
        public string PoNo { get; set; }
    }
}
