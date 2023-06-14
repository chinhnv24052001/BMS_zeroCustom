using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.InventoryGroup.Dto
{
    public class FilterMstInventoryGroup : PagedAndSortedInputDto
    {
        public string IventoryGroupName { get; set; }
        public string IventoryGroupCode { get; set; }
    }
}
