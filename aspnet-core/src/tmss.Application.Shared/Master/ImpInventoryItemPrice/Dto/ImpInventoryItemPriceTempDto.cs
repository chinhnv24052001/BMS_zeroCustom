using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.ImpInventoryItemPrice
{
    public class ImpInventoryItemPriceTempDto
    {
        public string ItemsCode { get; set; }
        public string PartNameSupplier { get; set; }
        public string SupplierCode { get; set; }
        public decimal? TaxPrice { get; set; }
        public string UnitOfMeasure { get; set; }
        public decimal? UnitPrice { get; set; }
        public string CurrencyCode { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public long? CurrencyId { get; set; }
        public long? SupplierId { get; set; }
        public long? UnitOfMeasureId { get; set; }
        public long? InventoryItemId { get; set; }
        public long? CreatorUserId { get; set; }
        public string Remark { get; set; }
    }
}
