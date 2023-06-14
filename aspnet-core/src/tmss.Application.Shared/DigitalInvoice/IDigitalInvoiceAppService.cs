using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.Common.Dto;
using tmss.DigitalInvoice.Dto;
using tmss.GR.Dto;

namespace tmss.DigitalInvoice
{
    public interface IDigitalInvoiceAppService : IApplicationService
    {
        Task<PagedResultDto<DigitalInvoiceInfoDto>> GetAllDigitalInvoiceInfo(DigitalInvoiceSearchInput input);
        Task<List<DigitalInvoiceDetailInfoDto>> GetAllDigitalInvoiceDetailInfo(long headerId);
        Task<List<DigitalInvoiceMatchResultsDto>> GetDigitalInvoiceMatchResults(long headerId);

    }
}
