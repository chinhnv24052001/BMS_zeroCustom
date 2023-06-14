using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.GR.Dto
{
    public class SearchAllReceiptsDto : PagedAndSortedInputDto
    {
        public string ReceiptNum { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public int? Status { get; set; }
        public string AuthorizationStatus { get; set; }
        public int ReceiptType { get; set; }
        public DateTime? ReceivedDateFrom { get; set; }
        public DateTime? ReceivedDateTo { get; set; }
    }
}
