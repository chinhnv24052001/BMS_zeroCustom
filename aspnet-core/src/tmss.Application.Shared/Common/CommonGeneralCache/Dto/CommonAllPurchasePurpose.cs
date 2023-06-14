using Abp.Application.Services.Dto;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllPurchasePurpose : EntityDto<long>
    {
        public string PurchasePurposeName { get; set; }
        public string PurchasePurposeCode { get; set; }
        public bool? HaveBudgetCode { get; set; }
        public int? Status { get; set; }
    }
}
