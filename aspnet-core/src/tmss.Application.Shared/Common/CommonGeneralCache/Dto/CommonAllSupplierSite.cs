using Abp.Application.Services.Dto;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllSupplierSite : EntityDto<long>
    {
        public string Country { get; set; }
        public string InvoiceCurrencyCode { get; set; }
        public string PaymentCurrencyCode { get; set; }
        public long SupplierId { get; set; }
        public string VendorSiteCode { get; set; }
        public string PurchasingSiteFlag { get; set; }
        public string AddressLine1 { get; set; }
        public string AddressLine2 { get; set; }
        public bool? IsDefault { get; set; }
    }
}
