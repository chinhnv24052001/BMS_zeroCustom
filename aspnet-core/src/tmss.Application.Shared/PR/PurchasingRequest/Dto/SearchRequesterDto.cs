using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class SearchRequesterDto : PagedAndSortedInputDto
    {
        public string UserName { get; set; }
    }
}
