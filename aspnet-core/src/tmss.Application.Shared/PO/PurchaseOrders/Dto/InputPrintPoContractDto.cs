using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class InputPrintPoContractDto
    {
        public long? TemplateContractId { get; set; }
        public long? PurchaseOrdersId { get; set; }
    }
}
