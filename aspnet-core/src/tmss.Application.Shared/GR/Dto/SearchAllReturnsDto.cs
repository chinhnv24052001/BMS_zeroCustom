using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.GR.Dto
{
    public class SearchAllReturnsDto : PagedAndSortedInputDto
    {
        public string ReceiptNum { get; set; }
        public long? VendorId { get; set; }
        public string PoNo { get; set; }
        public string PartNo { get; set; }
        public int ReceiptType { get; set; }
        public DateTime? ReceivedDateFrom { get; set; }
        public DateTime? ReceivedDateTo { get; set; }
    }
}
