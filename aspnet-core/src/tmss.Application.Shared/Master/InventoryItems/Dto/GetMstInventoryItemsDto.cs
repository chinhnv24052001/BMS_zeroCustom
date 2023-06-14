using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryItems.Dto
{
    public class GetMstInventoryItemsDto
    {
        public long Id { get; set; }
        public long InventoryGroupId { set; get; }
        public long InventoryItemId { set; get; }
        public long? SupplierId { set; get; }
        public string UnitPrice { set; get; }
        public string PrimaryUnitOfMeasure { set; get; }
        public string Category { set; get; }
        public long CategoryId { set; get; }
        public string PartNo { set; get; }
        public string Color { set; get; }
        public string PartName { set; get; }
        public string CategorySetname { set; get; }
        public string CurrencyCode { set; get; }
        public string SupplierName { set; get; }
        public string DestinationTypeCode { set; get; }
    }
}
