using Castle.MicroKernel.SubSystems.Conversion;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class InputPurchaseOrdersShipmentsDto
    {
        public long Id { get; set; }
        public long? PoHeaderId { get; set; }
        public long? PoLineId { get; set; }
        public decimal? Quantity { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public long? ShipToLocationId { get; set; }
        public DateTime? NeedByDate { get; set; }
        public DateTime? PromisedDate { get; set; }
        public long? ShipToOrganizationId { get; set; }
        public decimal? PriceOverride { get; set; }
        public int? ShipmentNum { get; set; }

        public List<InputPurchaseOrdersDistributionsDto> listDistributions { get; set; }

    }
}
