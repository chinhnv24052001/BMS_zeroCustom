using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryItems.Dto
{
    public class ImpInventoryItemPriceDto
    {
        public string ItemsCode { get; set; }
        public string PartNameSupplier { get; set; }
        public string SupplierCode { get; set; }
        public decimal? TaxPrice { get; set; }
        public long? UnitOfMeasureId { get; set; }
        public decimal? UnitPrice { get; set; }
        public long? CurrencyId { get; set; }
        public long? SupplierId { get; set; }
        public long? InventoryItemId { get; set; }
        public string EffectiveFrom { get; set; }
        public string EffectiveTo { get; set; }
        public string UnitOfMeasure { get; set; }
        public string CurrencyCode { get; set; }
        public long? CreatorUserId { get; set; }
        public string Remark { get; set; }

    }
}
