using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class GetPurchaseOrdersDto
    {
        public long Id { get; set; }
        public string OrdersNo { get; set; }
        public string Description { get; set; }
        public string TypeLookupCode { get; set; }
        public string AuthorizationStatus { get; set; }
        public string DepartmentApprovalName { get; set; }
        public string CheckBudgetStatus { get; set; }
        public string NoteOfSupplier { get; set; }
        public DateTime? OrderDate { get; set; }
        public string SupplierName { get; set; }
        public string VendorSiteCode { get; set; }
        public string Currency { get; set; }
        public string ProductGroupName { get; set; }
        public string RequestNote { get; set; }
        public string ReplyNote { get; set; }
        public string IsVendorConfirm { get; set; }
        public long Amount { get; set; }
        public long CreatorUserId { get; set; }
        public string BuyerName { get; set; }
        public long TotalCount { get; set; }
    }
}
