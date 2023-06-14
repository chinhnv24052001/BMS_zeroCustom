using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class InputPurchaseRequestHeaderDto
    {
        public long Id { get; set; }
        public long? PrepareId { get; set; }
        public long? PurchasePurposeId { get; set; }
        public string PrepareName { get; set; }
        public string RequisitionNo { get; set; }
        public string AuthorizationStatus { get; set; }
        public long? RequestId { get; set; }
        public string Description { get; set; }
        public string DestinationTypeCode { get; set; }
        public string ChargeAccount { get; set; }
        public string OriginalCurrencyCode { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? DestinationOrganizationId { get; set; }
        public long? DeliverToLocationId { get; set; }
        public decimal? TotalPrice { get; set; }
        public DateTime? RateDate { get; set; }
        public double? CurrencyRate { get; set; }
        public List<InputPurchaseRequestLineDto> inputPurchaseRequestLineDtos { get; set; }
    }
}
