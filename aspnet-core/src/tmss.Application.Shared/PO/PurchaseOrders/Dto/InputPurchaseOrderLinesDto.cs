using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class InputPurchaseOrderLinesDto
    {
        public long Id { get; set; }
        public long? PoHeaderId { get; set; }
        public long? LineTypeId { get; set; }
        public long? ItemId { get; set; }
        public long? CategoryId { get; set; }
        public long? UrLineId { get; set; }
        public string PartName { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public decimal? UnitPrice { get; set; }
        public decimal? ForeignPrice { get; set; }
        public decimal? Quantity { get; set; }
        public int? LineNum { get; set; }
        public DateTime? NeedByDate { get; set; }
        public DateTime? PromisedDate { get; set; }
        public DateTime? GlDate { get; set; }
        public string GuranteeTerm { get; set; }
        public string PoChargeAccount { get; set; }
        public string Attribute9 { get; set; }
        public string Attribute12 { get; set; }

        public List<InputPurchaseOrdersShipmentsDto> listPOShipments { get; set; }

    }
}
