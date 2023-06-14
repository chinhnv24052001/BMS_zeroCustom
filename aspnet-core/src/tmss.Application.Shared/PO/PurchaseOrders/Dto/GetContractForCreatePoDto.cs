using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class GetContractForCreatePoDto
    {
        public long? Id { get; set; }
        public string ContractNo { get; set; }
        public long? LineTypeId { get; set; }
        public long? ItemId { get; set; }
        public long? InventoryGroupId { get; set; }
        public string PartNo { get; set; }
        public string PartName { get; set; }
        public long? CategoryId { get; set; }
        public string Category { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public string UOMCode { get; set; }
        public DateTime? NeedByDate { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? UnitPrice { get; set; }
        public string DestinationTypeCode { get; set; }
        public long? DestinationOrganizationId { get; set; }
        public string RequesterName { get; set; }
        public string DestinationSubinventory { get; set; }
        public string SuggestedVendorName { get; set; }
        public long? VendorId { get; set; }
        public string SuggestedVendorLocation { get; set; }
        public long? VendorSiteId { get; set; }
        public long? DeliverToLocationId { get; set; }
        public long? ToPersonId { get; set; }
        public string LocationCode { get; set; }
        public string AddressSupplier { get; set; }
        public string SuggestedVendorContact { get; set; }
        public string SuggestedVendorPhone { get; set; }
        public long Amount { get; set; }
        public long TotalCount { get; set; }
        public string ChargeAccount { get; set; }
    }
}
