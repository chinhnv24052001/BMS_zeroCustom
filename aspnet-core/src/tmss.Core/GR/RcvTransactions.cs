using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.GR
{
    public class RcvTransactions : FullAuditedEntity<long>, IEntity<long>
    {
        public long? RequestId { get; set; }
        public long? ProgramApplicationId { get; set; }
        public long? ProgramId { get; set; }
        public DateTime? ProgramUpdateDate { get; set; }
        public string TransactionType { get; set; }
        public DateTime? TransactionDate { get; set; }
        public int Quantity { get; set; }
        public string UnitOfMeasure { get; set; }
        public long? ShipmentHeaderId { get; set; }
        public long? ShipmentLineId { get; set; }
        public string UserEnteredFlag { get; set; }
        public string InterfaceSourceCode { get; set; }
        public string SourceDocumentCode { get; set; }
        public string DestinationTypeCode { get; set; }
        public int? PrimaryQuantity { get; set; }
        public string PrimaryUnitOfMeasure { get; set; }
        public string UomCode { get; set; }
        public long? EmployeeId { get; set; }
        public long? ParentTransactionId { get; set; }
        public long? PoHeaderId { get; set; }
        public long? PoLineId { get; set; }
        public long? PoLineLocationId { get; set; }
        public long? PoDistributionId { get; set; }
        public int? PoRevisionNum { get; set; }
        [Column(TypeName = "decimal(19, 5)")]
        public decimal? PoUnitPrice { get; set; }
        public string CurrencyCode { get; set; }
        public string CurrencyConversionType { get; set; }
        [Column(TypeName = "decimal(19, 5)")]
        public decimal? CurrencyConversionRate { get; set; }
        public DateTime? CurrencyConversionDate { get; set; }
        public long? RoutingHeaderId { get; set; }
        public long? RoutingStepId { get; set; }
        public long? DeliverToPersonId { get; set; }
        public long? DeliverToLocationId { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public long? OrganizationId { get; set; }
        public string Subinventory { get; set; }
        public long? LocatorId { get; set; }
        public long? LocationId { get; set; }
        public string InspectionStatusCode { get; set; }
        public string AttributeCategory { get; set; }
        public string Attribute1 { get; set; }
        public string Attribute2 { get; set; }
        public string Attribute3 { get; set; }
        public string Attribute4 { get; set; }
        public string Attribute5 { get; set; }
        public long? ReasonId { get; set; }
        public string DestinationContext { get; set; }
        public string SourceDocUnitOfMeasure { get; set; }
        public int? SourceDocQuantity { get; set; }
        public long? InterfaceTransactionId { get; set; }
        public long? GroupId { get; set; }
        public string MrcCurrencyConversionType { get; set; }
        public string MrcCurrencyConversionDate { get; set; }
        public string MrcCurrencyConversionRate { get; set; }
        public string CountryOfOriginCode { get; set; }
        public string MvtStatStatus { get; set; }
        public string PaAdditionFlag { get; set; }
        public string ConsignedFlag { get; set; }
        public string FromSubinventory { get; set; }
        public long? FromLocatorId { get; set; }
    }
}
