using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryItems.Dto
{
    public class InventoryPriceSearchInputDto
    {
        public string Keyword { get; set; }
        public long InventoryGroupId { get; set; }
        public long SupplierId { get; set; }
        public long Page { get; set; }
        public long PageSize { get; set; }
    }
}

