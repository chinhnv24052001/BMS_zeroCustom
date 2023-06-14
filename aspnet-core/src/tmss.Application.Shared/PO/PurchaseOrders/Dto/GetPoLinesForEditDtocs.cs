using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class GetPoLinesForEditDtocs
    {

        public long Id { get; set; }
        public long? LineTypeId { get; set; }
        public long? ItemId { get; set; }
        public string PartNo { get; set; }
        public string PartName { get; set; }
        public decimal? Quantity { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public string Uom { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? ForeignPrice { get; set; }
        public long? CategoryId { get; set; }
        public int? LineNum { get; set; }
        public string Category { get; set; }
        public DateTime? NeedByDate { get; set; }

        public decimal? Amount { get; set; }

        public DateTime? PromisedDate { get; set; }
        public string GuranteeTerm { get; set; }
        public DateTime? GlDate { get; set; }
        public string PoChargeAccount { get; set; }

        public List<GetPoShipmentsByLineForEditDto> listPOShipments { get; set; }
    }
}
