using Castle.MicroKernel.SubSystems.Conversion;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class InputPurchaseOrdersDistributionsDto
    {
        public long Id { get; set; }
        public long? CodeCombinationId { get; set; }
        public long? PrRequisitionDistributionId { get; set; }
        public int? DeliverToLocationId { get; set; }
        public long? DeliverToPersonId { get; set; }
        public decimal? QuantityOrdered { get; set; }
        public string DestinationTypeCode { get; set; }
        public long? DestinationOrganizationId { get; set; }
        public int? DistributionNum { get; set; }
        public string DestinationSubinventory { get; set; }
        public DateTime? GlDate { get; set; }
        public string PoChargeAccount { get; set; }
        public string DestinationChargeAccount { get; set; }


    }
}
