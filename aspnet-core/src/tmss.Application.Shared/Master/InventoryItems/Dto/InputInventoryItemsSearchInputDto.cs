using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryItems.Dto
{
    public class InputInventoryItemsSearchInputDto
    {
        public long InventoryGroupId { get; set; }
        public string Keyword { get; set; }
        public long Page { get; set; }
        public long PageSize { get; set; }
    }
}
