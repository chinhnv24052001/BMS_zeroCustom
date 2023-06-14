using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class GetProductForExportDeventoryDto
    {
        public long? LineNum { get; set; }
        public string PartNo { get; set; }
        public string ProductName { get; set; }
        public string Specification { get; set; }
        public double? UnitPrice { get; set; }
        public double? Quanity { get; set; }
        public string Unit { get; set; }
        public double? SubTotal { get; set; }

        public int Mar02 { get; set; }
        public int Mar07 { get; set; }
        public int Mar13 { get; set; }
        public int Mar17 { get; set; }
        public int Forcast1 { get; set; }
        public int Forcast2 { get; set; }

        public string Warranty { get; set; }
    }
}
