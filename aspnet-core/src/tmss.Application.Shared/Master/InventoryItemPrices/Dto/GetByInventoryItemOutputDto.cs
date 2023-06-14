using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryItemPrices.Dto
{
    public class GetByInventoryItemOutputDto
    {
        public long Id { get; set; }
        public string UnitOfMeasure { get; set; }
        public string PartName { get; set; }
        public string CurrencyCode { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public decimal UnitPrice { get; set; }
        public int TotalCount { get; set; }

    }
}
