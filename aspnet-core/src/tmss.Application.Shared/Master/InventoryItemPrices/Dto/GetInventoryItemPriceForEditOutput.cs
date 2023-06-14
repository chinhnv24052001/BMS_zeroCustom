using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryItemPrices.Dto
{
    public class GetInventoryItemPriceForEditOutput
    {
        public long Id { get; set; }
        public long? UnitOfMeasureId { get; set; }
        public long? CurrencyId { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TaxPrice { get; set; }
    }
}
