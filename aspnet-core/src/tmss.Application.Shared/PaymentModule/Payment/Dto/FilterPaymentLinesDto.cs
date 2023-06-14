using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.Payment.Dto
{
    public class FilterPaymentLinesDto : PagedAndSortedInputDto
    {
        public string FilterSearch { get; set; }
    }
}
