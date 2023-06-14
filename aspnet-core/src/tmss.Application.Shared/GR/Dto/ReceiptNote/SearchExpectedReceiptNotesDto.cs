using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.GR.Dto
{
    public class SearchExpectedReceiptNotesDto : PagedAndSortedInputDto
    {
        public string PoNo { get; set; }
        public int? PoLineNum { get; set; }
        public int? PoShipmentNum { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public string ItemNo { get; set; }
        public int? TenantId { get; set; }
        public int ReceiptNoteType { get; set; }
    }
}
