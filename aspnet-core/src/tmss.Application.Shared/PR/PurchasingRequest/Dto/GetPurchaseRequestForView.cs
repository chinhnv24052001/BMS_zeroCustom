using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class GetPurchaseRequestForView
    {
        public long Id { get; set; }
        public string PrepareName { get; set; }
        public string RequisitionNo { get; set; }
        public string AuthorizationStatus { get; set; }
        public long RequestId { get; set; }
        public string Description { get; set; }
        public string ToPersonName { get; set; }
        public string InventoryGroupName { get; set; }
    }
}
