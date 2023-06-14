using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Threading.Tasks;
using tmss.PaymentModule.Prepayment.Dto;

namespace tmss.PaymentModule.Prepayment
{
    public interface IPrepaymentAppService : IApplicationService
    {
        Task<PagedResultDto<PaymentPrepaymentDto>> getAllPrepayment(SearchPrepaymentsDto input);
        Task Delete(long id);
        Task<PagedResultDto<GetPoHeadersDto>> getAllPOs(SearchPrepaymentsDto input);

    }
}
