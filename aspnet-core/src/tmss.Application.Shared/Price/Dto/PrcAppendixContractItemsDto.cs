using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Price.Dto
{
    public class PrcAppendixContractItemsDto
    {
        public long? Id { get; set; }
        public long? AppendixId { get; set; }
        public long? ContractId { get; set; }
        public long? ItemId { get; set; }
        public string PartNo { get; set; }
        public string Color { get; set; }
        public string InventoryGroupName { get; set; }
        public string PartName { get; set; }
        public string PartNameSupplier { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? TaxPrice { get; set; }
        public decimal? Qty { get; set; }
        public string CurrencyCode { get; set; }
        public string UnitOfMeasure { get; set; }
        public long? CountItem { get; set; }
        public long UnitOfMeasureId { get; set; }
        public decimal? TotalAmount { get; set; }
    }
}
