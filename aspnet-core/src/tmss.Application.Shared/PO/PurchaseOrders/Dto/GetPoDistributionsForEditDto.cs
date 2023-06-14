using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class GetPoDistributionsForEditDto
    {
        public long Id { get; set; }
        public string DestinationTypeCode { get; set; }
        public long? DeliverToPersonId { get; set; }
        public long? PrRequisitionDistributionId { get; set; }
        public string RequesterName { get; set; }
        public long? DeliverToLocationId { get; set; }
        public string DeliverTo { get; set; }
        public string Subinventory { get; set; }
        public decimal? QuantityOrdered { get; set; }
        public string PoChargeAccount { get; set; }
        public string DestinationChargeAccount { get; set; }
        public int? RecoveryRate { get; set; }
        public int? DistributionNum { get; set; }
        public DateTime? GlDate { get; set; }
    }
}
