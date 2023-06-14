using System;
using System.Collections.Generic;
using System.Text;
using tmss.UR.UserRequestManagement.Dto;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class GetPurchaseRequestForEditDto
    {
        public long Id { get; set; }
        public long PreparerId { get; set; }
        public long? PurchasePurposeId { get; set; }
        public string PrepareName { get; set; }
        public string RequisitionNo { get; set; }
        public string AuthorizationStatus { get; set; }
        public long RequestId { get; set; }

        public long? DestinationOrganizationId { get; set; }
        public long? DeliverToLocationId { get; set; }
        public DateTime? RateDate { get; set; }
        public string Description { get; set; }
        public long ToPersonId { get; set; }
        public long InventoryGroupId { get; set; }
        public string RequestNote { get; set; }
        public string ChargeAccount { get; set; }
        public string OriginalCurrencyCode { get; set; }
        public string ReplyNote { get; set; }
        public List<GetAllPurchaseRequestAttachmentsForViewDto> Attachments { get; set; }
        public List<GetPurchaseRequestLineForEditDto> getPurchaseRequestLineForEditDtos { get; set; }
    }
}
