using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Payment.Dto
{
    public class FilterPaymentHeadersDto : PagedAndSortedInputDto
    {
        public string PaymentNo { get; set; }
        public string InvoiceNo { get; set; }
        public string PoNo { get; set; }
        public DateTime? RequestDateFrom { get; set; }
        public DateTime? RequestDateTo { get; set; }
        public long? VendorId { get; set; }
        public long? EmployeeId { get; set; }
        public int? Status { get; set; }
        public string AuthorizationStatus { get; set; }
    }
}
