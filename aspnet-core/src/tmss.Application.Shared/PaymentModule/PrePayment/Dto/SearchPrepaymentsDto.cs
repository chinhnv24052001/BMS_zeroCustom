using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Prepayment.Dto
{
    public class SearchPrepaymentsDto : PagedAndSortedInputDto
    {
        public string PoNo { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public long? InvoiceId { get; set; }
    }
}
