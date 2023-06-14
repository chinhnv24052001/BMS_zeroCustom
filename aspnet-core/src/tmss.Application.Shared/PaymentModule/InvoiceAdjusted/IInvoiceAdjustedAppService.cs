using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.PaymentModule.InvoiceAdjusted.Dto;
using tmss.PaymentModule.Payment.Dto;

namespace tmss.PaymentModule.InvoiceAdjusted
{
    public interface IInvoiceAdjustedAppService : IApplicationService
    {
        Task<long> CreateOrEditInvoiceAdjusted(InputInvoiceAdjustedHeadersDto inputInvoiceAdjustedHeadersDto);
        Task<InputInvoiceAdjustedHeadersDto> getInvoiceAdjestedId(long? id);

        Task deleteInvoiceAdjusted(long? id);
        Task<PagedResultDto<GetAllInvoiceAdjustedDto>> getAllInvoiceAdjusted(InputSearchInvoiceAdjustedDto inputSearchInvoiceAdjustedDto);

        Task<List<GetListInvoiceHeadersDto>> getListInvoiceHeadersByVendorId(long vendorId);
        Task<List<GetListInvoiceLinesDto>> getListInvoiceLineByHeadersId(long headerId);
    }
}
