using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.PurchasePurpose.Dto
{
    public class SearchPurchasePurposeDto : PagedAndSortedInputDto
    {
        public string PurchasePurposeName { get; set; }
    }
}
