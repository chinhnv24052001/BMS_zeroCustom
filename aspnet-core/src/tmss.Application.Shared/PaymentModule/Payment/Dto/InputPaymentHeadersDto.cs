using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PaymentModule.Payment.Dto
{
    public class InputPaymentHeadersDto  
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
        public long? DocumentId { get; set; }
        public string AuthorizationStatus { get; set; }
        public int Status { get; set; }

        public List<InputPaymentLinesDto> InputPaymentLinesDto { get; set; }

        public List<PaymentAttachmentsDto> Attachments { get; set; }
    }
}
