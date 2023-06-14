using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Payment.Dto
{
    public class FilterInvoiceHeadersDto : PagedAndSortedInputDto
    {
        public string InvoiceNum { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public string CurrencyCode { get; set; }
    }
}
