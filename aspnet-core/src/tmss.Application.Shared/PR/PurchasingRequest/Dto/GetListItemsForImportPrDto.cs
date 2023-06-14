using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class GetListItemsForImportPrDto
    {
        public long Id { get; set; }
        public long? ItemId { get; set; }
        public long? DeliverToLocationId { get; set; }
        public long? CodeCombinationId { get; set; }
        public string ProductCode { get; set; }
        public string Comments { get; set; }
        public string BudgetCode { get; set; }
        public decimal? Quanity { get; set; }
        public string SuggestedVendorName { get; set; }
        public long? VendorId { get; set; }
        public string SuggestedVendorLocation { get; set; }
        public long? VendorSiteId { get; set; }
        public string MonthN { get; set; }
        public string MonthN1 { get; set; }
        public string MonthN2 { get; set; }
        public string MonthN3 { get; set; }
        public long? DestinationOrganizationId { get; set; }
        public string ItemDescription { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public string NeedBy { get; set; }
        public string DestinationTypeCode { get; set; }
        public decimal? UnitPrice { get; set; }
        public long? CreatorUserId { get; set; }
        public long? CategoryId { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? CurrencyId { get; set; }
    }
}
