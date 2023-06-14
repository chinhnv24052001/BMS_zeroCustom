using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.GR.Dto.ReceiptNote
{
   public class SearchPosForReceiptNotesDto : PagedAndSortedInputDto
    {
        public string PoNo { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public int ReceiptNoteType { get; set; }
    }
}
