using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.GR.Dto
{
    public class SearchAllReceiptNotesDto : PagedAndSortedInputDto
    {
        public string ReceiptNoteNum { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public int? Status { get; set; }
        public int ReceiptNoteType { get; set; }
        public DateTime? ShippedDateFrom { get; set; }
        public DateTime? ShippedDateTo { get; set; }
    }
}
