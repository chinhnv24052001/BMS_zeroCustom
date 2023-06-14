using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PayPalCheckoutSdk.Orders;

namespace tmss.PR
{
    public class PrRequisitionLines : FullAuditedEntity<long>, IEntity<long>
    {
        public long? PrRequisitionHeaderId { get; set; }
        public int? LineNum { get; set; }
        public long? LineTypeId { get; set; }
        public long? CategoryId { get; set; }
        public long? UrLineId { get; set; }
        public string ItemDescription { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? ForeignPrice { get; set; }
        public decimal? Quantity { get; set; }
        public long? DeliverToLocationId { get; set; }
        public long? ToPersonId { get; set; }
        public string SourceTypeCode { get; set; }
        public DateTime? LastUpdateLogin { get; set; }
        public long? ItemId { get; set; }
        public decimal? QuantityDelivered { get; set; }
        public long? SuggestedBuyerId { get; set; }
        public DateTime? NeedByDate { get; set; }
        public long? LineLocationId { get; set; }
        public string CurrencyCode { get; set; }
        public string RateType { get; set; }
        public DateTime? RateDate { get; set; }
        public string Rate { get; set; }
        public string CurrencyUnitPrice { get; set; }
        public string SuggestedVendorName { get; set; }
        public string SuggestedVendorLocation { get; set; }
        public string SuggestedVendorContact { get; set; }
        public string SuggestedVendorPhone { get; set; }
        public string OnRfqFlag { get; set; }
        public string UrgentFlag { get; set; }
        public string CancelFlag { get; set; }
        public string DestinationTypeCode { get; set; }
        public long? DestinationOrganizationId { get; set; }
        public string DestinationSubinventory { get; set; }
        public decimal? QuantityCancelled { get; set; }
        public DateTime? CancelDate { get; set; }
        public string CancelReason { get; set; }
        public string ClosedCode { get; set; }
        public string DestinationContext { get; set; }
        public string Attribute1 { get; set; }
        public string Attribute2 { get; set; }
        public string Attribute3 { get; set; }
        public string Attribute4 { get; set; }
        public string Attribute5 { get; set; }
        public string Attribute6 { get; set; }
        public string Attribute7 { get; set; }
        public string Attribute8 { get; set; }
        public string Attribute9 { get; set; }
        public string Attribute10 { get; set; }
        public string Attribute11 { get; set; }
        public string Attribute12 { get; set; }
        public string Attribute13 { get; set; }
        public string Attribute14 { get; set; }
        public string Attribute15 { get; set; }
        public long? OrgId { get; set; }
        public string TaxUserOverrideFlag { get; set; }
        public long? TaxCodeId { get; set; }
        public string OrderTypeLookupCode { get; set; }
        public string PurchaseBasis { get; set; }
        public string MatchingBasis { get; set; }
        public string NegotiatedByPreparerFlag { get; set; }
        public decimal? BaseUnitPrice { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }

    }
}
