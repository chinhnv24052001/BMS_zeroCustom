using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;


namespace tmss.Master.InventoryGroup.Dto
{
    public class InventoryItemsSearchDto : PagedAndSortedInputDto
    {
        public string FilterSearch { get; set; }
    }
}
