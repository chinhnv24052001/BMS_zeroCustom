using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Invoices.Dto
{
    public class FilterInvoiceDto : PagedAndSortedInputDto
    {
        public string FilterInvoice { get; set; }
    }
}
