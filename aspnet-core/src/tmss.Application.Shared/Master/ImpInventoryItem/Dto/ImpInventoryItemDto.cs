using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.ImpInventoryItem.Dto
{
    public class ImpInventoryItemDto
    {
        public string ItemsCode { get; set; }
        public string PartNameSupplier { get; set; }
        public string ProductGroupName { get; set; }
        public long? InventoryItemId { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? CreatorUserId { get; set; }
        public string ProductImage { get; set; }
        public byte[] ByteFileImage { get; set; }
        public string Remark { get; set; }
        
    }
}
