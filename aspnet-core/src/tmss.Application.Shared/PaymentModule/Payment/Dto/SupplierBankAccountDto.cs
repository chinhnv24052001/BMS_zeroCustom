using Abp.Application.Services.Dto;

namespace tmss.PaymentModule.Payment.Dto
{
    public class SupplierBankAccountDto: EntityDto<long?>
    {
        public long? SupplierId { get; set; }
        public long? SupplierSiteId { get; set; }
        public long? CurrencyId { get; set; }
        public byte IsPrimary { get; set; }
        public string BankName { get; set; }
        public string BankAccountName { get; set; }
        public string BankAccountNum { get; set; }
    }
}