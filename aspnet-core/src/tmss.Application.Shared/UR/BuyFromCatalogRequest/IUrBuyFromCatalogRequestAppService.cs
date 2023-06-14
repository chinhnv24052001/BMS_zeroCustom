using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.UR.BuyFromCatalogRequest.Dto;

namespace tmss.UR.BuyFromCatalogRequest
{
    public interface IUrBuyFromCatalogRequestAppService : IApplicationService
    {
        Task<PagedResultDto<GetAllCatalogProductForViewDto>> GetAllCatalogProducts(GetAllCatalogProductInput input);
    }
}
