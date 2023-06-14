using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PaymentModule.Payment.Dto
{
    public interface IPaymentHeadersAppService : IApplicationService
    {
        Task<PagedResultDto<PaymentHeadersDto>> getAllPayment(FilterPaymentHeadersDto filter);
        Task<long> CreateOrEditPayment(InputPaymentHeadersDto paymentHeadersDto);
        Task<PaymentHeadersDto> getPaymentById(long? id);
        Task<PagedResultDto<InputPaymentLinesDto>> getAllPaymentLineByHeaderID(long? headerid);
        Task CancelPayment(long id);
        Task<List<PaymentFromSuppliersDto>> getAllPaymentFromSupplier(FilterPaymentFromSupliersDto input);
        Task<byte[]> getDataForPrint(long id);
        Task<SupplierBankAccountDto> getSupplierBankAccountInfo(long? supplierId,long? supplierSiteId,string currencyCode);
    }
}
