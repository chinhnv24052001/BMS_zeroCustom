using System;
using System.Collections.Generic;
using System.Reflection.Emit;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class GetPoShipmentsByLineForEditDto
    {
        public long Id { get; set; }
        public long? ShipToOrganizationId { get; set; }
        public long? ShipToLocationId { get; set; }
        public string ShipTo { get; set; }
        public string UOM { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public decimal? Quantity { get; set; }
        public int? ShipmentNum { get; set; }
        public DateTime? PromisedDate { get; set; }
        public DateTime? NeedByDate { get; set; }

        public DateTime? OriginalDate { get; set; }
        public string NoteForReceiver { get; set; }
        public string CountryOfOrigin { get; set; }
        public string ChargeAccount { get; set; }

        public List<GetPoDistributionsForEditDto> listDistributions { get; set; }

    }
}
