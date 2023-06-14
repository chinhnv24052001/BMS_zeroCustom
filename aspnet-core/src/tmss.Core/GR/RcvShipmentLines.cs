using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.GR
{
    public class RcvShipmentLines : FullAuditedEntity<long>, IEntity<long>
    {
        public long ShipmentHeaderId { get; set; }
        public int? LineNum { get; set; }
        public long? CategoryId { get; set; }
        public decimal? QuantityShipped { get; set; }
        public decimal? QuantityReceived { get; set; }
        public decimal? QuantityReturned { get; set; }
        //public int? QuantityReceived { get; set; }
        // public int? QuantityReturned { get; set; }
        public string UnitOfMeasure { get; set; }
        public string ItemDescription { get; set; }
        public long? ItemId { get; set; }
        public string ItemRevision { get; set; }
        public string ShipmentLineStatusCode { get; set; }
        public string SourceDocumentCode { get; set; }
        public long? PoHeaderId { get; set; }
        public long? PoLineId { get; set; }
        public long? PoLineShipmentId { get; set; }
        public long? PoDistributionId { get; set; }
        public long? RoutingHeaderId { get; set; }
        public long? DeliverToPersonId { get; set; }
        public long? EmployeeId { get; set; }
        public string DestinationTypeCode { get; set; }
        public long? ToOrganizationId { get; set; }
        public string ToSubinventory { get; set; }
        public long? LocatorId { get; set; }
        public long? DeliverToLocationId { get; set; }
        public long? RequestId { get; set; }
        public string PrimaryUnitOfMeasure { get; set; }
        public string AsnLineFlag { get; set; }
        public long? ShipToLocationId { get; set; }
        public string CountryOfOriginCode { get; set; }
        public decimal? SecondaryQuantityReceived { get; set; }
        public decimal? AmountReceived { get; set; }

        public long? ReceiptNoteHeaderId { get; set; }
        public long? ReceiptNoteLineId { get; set; }
        public string PartNo { get; set; }
        public long? InventoryGroupId { get; set; }
        public string Remark { get; set; }
    }
}
