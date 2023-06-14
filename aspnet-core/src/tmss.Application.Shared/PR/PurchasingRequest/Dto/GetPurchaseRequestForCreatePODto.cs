using System;
using System.Collections.Generic;
using System.Text;
using tmss.PO.PurchaseOrders.Dto;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class GetPurchaseRequestForCreatePODto
    {
        public long? Id { get; set; }
        public string RequisitionNo { get; set; }
        public long? PrRequisitionHeaderId { get; set; }
        public long? LineTypeId { get; set; }
        public long? ItemId { get; set; }
        public long? InventoryGroupId { get; set; }
        public string PartNo { get; set; }
        public string PartName { get; set; }
        public string ProductGroupName { get; set; }
        public long? CategoryId { get; set; }
        public string Category { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public string UOMCode { get; set; }
        public DateTime? NeedByDate { get; set; }
        public DateTime? RateDate { get; set; }
        public decimal? Quantity { get; set; }
        public int? CurrencyId { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? ForeignPrice { get; set; }
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
        public string RequestNote { get; set; }
        public string ReplyNote { get; set; }
        public long Amount { get; set; }
        public string Attribute9 { get; set; } //Forecast N
        public string Attribute12 { get; set; } //Forecast N1
        public string Attribute14 { get; set; } //Forecast N2
        public string Attribute15 { get; set; } //Forecast N3
        public string Attribute10 { get; set; } //remark
        public string Attribute11 { get; set; }
        public long TotalCount { get; set; }
        public string ChargeAccount { get; set; }
    }
}
