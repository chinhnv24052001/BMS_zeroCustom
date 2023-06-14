using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryGroup.Dto
{
    public class MstInventoryItemsDto
    {
        public long?Id { get; set; }
        public long? InventoryItemId { get; set; }
        public long? OrganizationId { get; set; }
        public string PrimaryUomCode { get; set; }
        public string PrimaryUnitOfMeasure { get; set; }
        public string ItemType { get; set; }
        public int IsActive { get; set; }
        public int InventoryItemFlag { get; set; }
        public string CostOfSalesAccount { get; set; }
        public string ExpenseAccount { get; set; }
        public string SalesAccount { get; set; }
        public string PartNo { get; set; }
        public string PartCode { get; set; }
        public string PartNameSupplier { get; set; }
        public decimal? UnitPrice { get; set; }
        public string CurrencyCode { get; set; }
        public string SupplierName { get; set; }
        public decimal? TaxPrice { get; set; }
        public string Color { get; set; }
        public string PartName { get; set; }
        public decimal? ListPrice { get; set; }
        public long? InventoryGroupId { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }

    }
}
