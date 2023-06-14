using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class InputSearchContractDto : PagedAndSortedInputDto
    {
        public string ContractNo { get; set; }
        public long? SupplierId { get; set; }
        public DateTime? FromDate { get; set; }
        public DateTime? ToDate { get; set; }
    }
}
