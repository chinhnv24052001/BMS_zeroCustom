using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PaymentModule.Payment.Dto
{
    public interface IPaymentFromSuppliers : IApplicationService
    {
        Task<PagedResultDto<PaymentFromSuppliersDto>> getAllPayment(FilterPaymentFromSupliersDto filter);
        Task CreateOrEditPayment(InputPaymentFromSuppliersDto paymentHeadersDto);
        Task CancelPayment(long id);
        //Task<PagedResultDto<GetInvoiceHeadersDto>> getAllInvoices(FilterInvoiceHeadersDto input);
    }
}
