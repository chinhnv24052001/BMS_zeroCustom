using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryItemPrices.Dto
{
    public class MstInventoryItemPricesDto
    {
        public long id { get; set; }
        public long? InventoryItemId { get; set; }
        public long? UnitOfMeasureId { get; set; }
        public long? CurrencyId { get; set; }
    }
}
