using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryCodeConfig.Dto
{
    public class MstInventoryCodeConfigDto
    {
        public long? Id { get; set; }
        public string InventoryGroupCode { get; set; }
        public string InventoryGroupName { get; set; }
        public string CodeHeader { get; set; }
        public string StartNum { get; set; }
        public string EndNum { get; set; }
        public string CurrentNum { get; set; }
        public string Status { get; set; }
        public string DocCode { get; set; }

    }
}
