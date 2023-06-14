using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class GetPurchaseRequestLineForView
    {
        public long? Id { get; set; }
        public long? PrRequisitionHeaderId { get; set; }
        public string LineTypeName { get; set; }
        public long? ItemId { get; set; }
        public string PartNo { get; set; }
        public string PartName { get; set; }
        public long? CategoryId { get; set; }
        public string CategoryName { get; set; }
        public string Uom { get; set; }
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

        public string Attribute9 { get; set; } //Forecast N
        public string Attribute12 { get; set; } //Forecast N1
        public string Attribute14 { get; set; } //Forecast N2
        public string Attribute15 { get; set; } //Forecast N3
        public string Attribute10 { get; set; } //remark
        public string Attribute11 { get; set; }
    }
}
