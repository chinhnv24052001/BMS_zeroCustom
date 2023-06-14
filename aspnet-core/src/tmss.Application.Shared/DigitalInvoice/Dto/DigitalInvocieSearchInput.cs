using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.DigitalInvoice.Dto
{
    public class DigitalInvoiceSearchInput : PagedAndSortedInputDto
    {
        public string InvoiceNum { get; set; }
        public string SerialNo { get; set; }
        public string SupplierNum { get; set; }
        public int Status { get; set; }
    }
}
