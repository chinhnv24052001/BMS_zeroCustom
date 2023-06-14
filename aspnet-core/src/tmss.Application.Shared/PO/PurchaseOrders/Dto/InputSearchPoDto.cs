using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class InputSearchPoDto : PagedAndSortedInputDto
    {
        public string OrdersNo { get; set; }
        public long? SupplierId { get; set; }
        public long? BillToLocationId { get; set; }
        public long? ShipToLocationId { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? BuyerId { get; set; }
        public bool? IsInternal { get; set; }
        public string Status { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
