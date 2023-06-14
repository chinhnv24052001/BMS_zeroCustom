using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Payment.Dto
{
    public class FilterPaymentFromSupliersDto : PagedAndSortedInputDto
    {
        public string PaymentNo { get; set; }
        public DateTime? RequestDateFrom { get; set; }
        public DateTime? RequestDateTo { get; set; }
        public long? VendorId { get; set; }
        public long? EmployeeId { get; set; }
        public int? Status { get; set; }
        public string AuthorizationStatus { get; set; }
        public string InvoiceNumber { get; set; }
        public string PoNo { get; set; }
        public string CurrencyCode { get; set; }
    }
}
