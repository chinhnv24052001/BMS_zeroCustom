using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class SearchPurchaseRequestDto : PagedAndSortedInputDto
    {
        public string RequisitionNo { get; set; }
        public long? PreparerId { get; set; }
        public long? BuyerId { get; set; }
        public long? InventoryGroupId { get; set; }
        public string Status { get; set; }
        public bool? IsInternal { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set;}

    }
}
