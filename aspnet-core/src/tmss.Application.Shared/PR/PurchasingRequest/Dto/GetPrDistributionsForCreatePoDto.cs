using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class GetPrDistributionsForCreatePoDto
    {
        public long PrDistributionsId { get; set; }
        public long PrRequisitionLineId { get; set; }
        public long PrRequisitionHeaderId { get; set; }
        public string DestinationTypeCode { get; set; }
        public long? DeliverToPersonId { get; set; }
        public string RequesterName { get; set; }
        public long? DeliverToLocationId { get; set; }
        public string DeliverTo { get; set; }
        public string ProductGroupName { get; set; }
        public string Subinventory { get; set; }
        public string InventoryGroupId { get; set; }
        public decimal? QuantityOrdered { get; set; }
        public string PoChargeAccount { get; set; }
        public string DestinationChargeAccount { get; set; }
        public int? RecoveryRate { get; set; }
        public DateTime? GlDate { get; set; }
    }
}
