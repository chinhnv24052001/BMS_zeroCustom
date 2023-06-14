using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class GetListItemsForImportPo
    {
        public long Id { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public long? ItemId { get; set; }
        public string Comments { get; set; }
        public long? CodeCombinationId { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public string PriceType { get; set; }
        public string BudgetCode { get; set; }
        public string NeedByPaintSteel { get; set; }
        public string GlDate { get; set; }
        public long? OrganizationId { get; set; }
        public string DestinationType { get; set; }
        public long? LocationId { get; set; }
        public long? CategoryId { get; set; }
        public long? CreatorUserId { get; set; }
        public long? InventoryGroupId { get; set; }
        public string Subinventory { get; set; }
        public string CurrencyCode { get; set; }
        public string PartName { get; set; }
        public string PrimaryUnitOfMeasure { get; set; }
    }
}
