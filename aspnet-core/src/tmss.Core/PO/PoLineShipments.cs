using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PO
{
    public class PoLineShipments : FullAuditedEntity<long>, IEntity<long>
    {
        public long? PoHeaderId { get; set; }
        public long? PoLineId { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? QuantityReceived { get; set; }
        public decimal? QuantityAccepted { get; set; }
        public decimal? QuantityRejected { get; set; }
        public decimal? QuantityBilled { get; set; }
        public decimal? QuantityCancelled { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public long? ShipToLocationId { get; set; }
        public DateTime? NeedByDate { get; set; }
        public DateTime? PromisedDate { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? PriceOverride { get; set; }
        public string EncumberedFlag { get; set; }
        public string TaxableFlag { get; set; }
        public string ApprovedFlag { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string ClosedFlag { get; set; }
        public string CancelFlag { get; set; }
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
        public string InspectionRequiredFlag { get; set; }
        public string ReceiptRequiredFlag { get; set; }
        public decimal? QtyRcvTolerance { get; set; }
        public string QtyRcvExceptionCode { get; set; }
        public string EnforceShipToLocationCode { get; set; }
        public string AllowSubstituteReceiptsFlag { get; set; }
        public int? DaysEarlyReceiptAllowed { get; set; }
        public int? DaysLateReceiptAllowed { get; set; }
        public string ReceiptDaysExceptionCode { get; set; }
        public int? InvoiceCloseTolerance { get; set; }
        public int? ReceiveCloseTolerance { get; set; }
        public long? ShipToOrganizationId { get; set; }
        public int? ShipmentNum { get; set; }
        public string ShipmentType { get; set; }
        public string ClosedCode { get; set; }
        public long? ReceivingRoutingId { get; set; }
        public string AccrueOnReceiptFlag { get; set; }
        public string ClosedReason { get; set; }
        public DateTime? ClosedDate { get; set; }
        public long? ClosedBy { get; set; }
        public long? OrgId { get; set; }
        public decimal? QuantityShipped { get; set; }
        public string CountryOfOriginCode { get; set; }
        public string TaxUserOverrideFlag { get; set; }
        public string MatchOption { get; set; }
        public long? TaxCodeId { get; set; }
        public string CalculateTaxFlag { get; set; }
        public int? SecondaryQuantityReceived { get; set; }
        public string ConsignedFlag { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? AmountReceived { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? AmountBilled { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? AmountCancelled { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? AmountRejected { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? AmountAccepted { get; set; }
        public string DropShipFlag { get; set; }
        public DateTime? ShipmentClosedDate { get; set; }
        public DateTime? ClosedForReceivingDate { get; set; }
        public DateTime? ClosedForInvoiceDate { get; set; }
        public decimal? SecondaryQuantityShipped { get; set; }
        public string ValueBasis { get; set; }
        public string MatchingBasis { get; set; }


    }
}
