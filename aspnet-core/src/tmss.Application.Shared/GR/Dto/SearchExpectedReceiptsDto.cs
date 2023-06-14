using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.GR.Dto
{
    public class SearchExpectedReceiptsDto : PagedAndSortedInputDto
    {
        public string PoNo { get; set; }
        public int? PoLineNum { get; set; }
        public int? PoShipmentNum { get; set; }
        public string PrNo { get; set; }
        public int? PrLineNum { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public long? ReceivingLocationId { get; set; }
        public string ItemNo { get; set; }
        public int? TenantId { get; set; }
        public int ReceiptType { get; set; }
    }
}
