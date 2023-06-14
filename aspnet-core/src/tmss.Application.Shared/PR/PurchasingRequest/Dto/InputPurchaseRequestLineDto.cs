using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class InputPurchaseRequestLineDto
    {
        public long Id { get; set; }
        public long? PrRequisitionHeaderId { get; set; }
        public long? LineTypeId { get; set; }
        public long? ItemId { get; set; }
        public long? CategoryId { get; set; }
        public long? UrLineId { get; set; }
        public string PartName { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? ForeignPrice { get; set; }
        public decimal? Quantity { get; set; }
        public DateTime? NeedByDate { get; set; }
        public long? LineLocationId { get; set; }
        public string DestinationTypeCode { get; set; }
        public long? DestinationOrganizationId { get; set; }
        public long? DeliverToLocationId { get; set; }
        public long? ToPersonId { get; set; }
        public string OrderTypeLookupCode { get; set; }
        public string PurchaseBasis { get; set; }
        public string MatchingBasis { get; set; }
        public string SourceTypeCode { get; set; }
        public string SuggestedVendorName { get; set; }
        public string SuggestedVendorLocation { get; set; }
        public string SuggestedVendorContact { get; set; }
        public string SuggestedVendorPhone { get; set; }
        public string Attribute9 { get; set; } //Forecast N
        public string Attribute12 { get; set; } //Forecast N1
        public string Attribute14 { get; set; } //Forecast N2
        public string Attribute15 { get; set; } //Forecast N3
        public string Attribute10 { get; set; } //remark
        public string Attribute11 { get; set; } // suggest vendor
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public long? DistributionsId { get; set; }
        public string ChargeAccount { get; set; }
        public DateTime? GlDate { get; set; }
        public string BudgetAccount { get; set; }
        public string AccrualAccount { get; set; }
        public string VarianceAccount { get; set; }

        public List<GetPurchaseRequestDistributionsDto> listDistributions { get; set; }
    }
}
