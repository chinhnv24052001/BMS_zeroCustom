using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryGroup.Dto
{
    public class GetMstInventoryGroupDto
    {
        public long Id { get; set; }
        public string ProductGroupName { get; set; }
        public string ProductGroupCode { get; set; }
        public bool? IsCatalog { get; set; }
        public bool? IsInventory { get; set; }
    }
}
