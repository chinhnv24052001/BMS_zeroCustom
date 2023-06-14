using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PaymentModule.InvoiceAdjusted.Dto
{
    public class InputSearchInvoiceAdjustedDto : PagedAndSortedInputDto
    {
        public long? SupplierId { get; set; }
        public string InvoiceNo { get; set; }
        public string SerialNo { get; set; }
    }
}
