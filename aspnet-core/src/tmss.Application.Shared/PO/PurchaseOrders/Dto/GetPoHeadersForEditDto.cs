using System;
using System.Collections.Generic;
using System.Text;
using tmss.PR.PurchasingRequest.Dto;

namespace tmss.PO.PurchaseOrders.Dto
{
    public class GetPoHeadersForEditDto
    {
        public long Id { get; set; }
        public long? BuyerId { get; set; }
        public string BuyerName { get; set; }
        public string TypeLookupCode { get; set; }
        public string Segment1 { get; set; } //poNo
        public long? VendorId { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? VendorSiteId { get; set; }
        public long? VendorContactId { get; set; }
        public long? ShipToLocationId { get; set; }
        public long? BillToLocationId { get; set; }
        public string CurrencyCode { get; set; }
        public string VendorName { get; set; }
        public string ShipToLocationName { get; set; }
        public string BillToLocationName { get; set; }
        public string PoRef { get; set; }
        public DateTime? RateDate { get; set; }
        public string AuthorizationStatus { get; set; }
        public string CheckBudgetStatus { get; set; }
        public string ApprovedFlag { get; set; }
        public string Description { get; set; }
        public string ChargeAccount { get; set; }
        public long? TermsId { get; set; }
        public string Attribute10 { get; set; }
        public string Attribute11 { get; set; }
        public string Attribute12 { get; set; }
        public string Attribute13 { get; set; }
        public string Attribute14 { get; set; }
        public string Attribute15 { get; set; }
        public string RequestNote { get; set; }
        public string ReplyNote { get; set; }
        public bool? IsPrepayReceipt { get; set; }
        public List<GetAllPurchaseOrdersAttachmentsForViewDto> Attachments { get; set; }
        public List<GetPoLinesForEditDtocs> inputPurchaseOrderLinesDtos { get; set; }
    }
}
