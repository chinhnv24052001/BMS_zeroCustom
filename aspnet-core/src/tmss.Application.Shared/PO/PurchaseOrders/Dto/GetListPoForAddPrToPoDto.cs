using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class GetListPoForAddPrToPoDto
    {
        public long Id { get; set; }
        public string PoNumber { get; set; }
        public string SupplierName { get; set; }
        public string Descriptions { get; set; }
    }
}
