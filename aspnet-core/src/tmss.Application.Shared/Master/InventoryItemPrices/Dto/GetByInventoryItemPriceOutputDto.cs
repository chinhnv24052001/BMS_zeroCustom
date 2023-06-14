using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryItemPrices.Dto
{
    public class GetByInventoryItemPriceOutputDto
    {
        public long Id { get; set; }
        public string PartNo { get; set; }
        public string Color { get; set; }
        public string PartName { get; set; }
        public string PartNameSupplier { get; set; }
        public string SupplierName { get; set; }
        public string CurrencyCode { get; set; }
        public decimal UnitPrice { get; set; }
        public decimal TaxPrice { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
       
    }
}
