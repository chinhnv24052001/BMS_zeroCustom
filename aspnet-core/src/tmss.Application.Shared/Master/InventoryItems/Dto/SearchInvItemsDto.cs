using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryItems.Dto
{
    public class SearchInvItemsDto
    {
        public long? InventoryGroupId { set; get; }
        public long? SupplierId { set; get; }
        public string CurrencyCode { set; get; }
        public string PartNo { set; get; }
        public DateTime? DocumentDate { set; get; }
    }
}
