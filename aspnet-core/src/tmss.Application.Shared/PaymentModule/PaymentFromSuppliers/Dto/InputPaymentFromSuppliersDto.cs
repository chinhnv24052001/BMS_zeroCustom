using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.Payment.Dto
{
    public class InputPaymentFromSuppliersDto
    {
        public long Id { get; set; }
        public string PaymentNo { get; set; }
        public DateTime RequestDate { get; set; }
        public DateTime RequestDuedate { get; set; }
        public string Description { get; set; }
        public long? EmployeeId { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public string CurrencyCode { get; set; }
        public decimal? TotalAmount { get; set; }
        public int TotalCount { get; set; }
        public string PaymentMethod { get; set; }
        public string BankAccountName { get; set; }
        public string BankAccountNumber { get; set; }
        public string BankName { get; set; }
        public string BankBranchName { get; set; }
        public string InvoiceNumber { get; set; }
        public decimal? InvoiceAmount { get; set; }
        public DateTime? InvoiceDate { get; set; }
        public decimal? PrepaymentAmount { get; set; }
        public string PoNo { get; set; }
        public long? InvoiceId { get; set; }
        public long? PoHeaderId { get; set; }
        public decimal? TotalPrice { get; set; }
        public decimal? TotalPriceUsd { get; set; }
        public int SourcePayment { get; set; }
        public decimal? AvailableAmount { get; set; }
        public List<PaymentFromSupplierAttachmentsDto> Attachments { get; set; }
    }
}
