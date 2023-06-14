using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Catalog.Dto;
using tmss.Master.ExchangeRate.Dto;

namespace tmss.Master.Catalog
{
    public interface IMstCatalogAppService
    {
        Task<PagedResultDto<SearchCatalogOutputDto>> GetAllData(GetCatalogSearchInput searchInputDto);
        Task CreateOrEdit(SearchCatalogOutputDto dto);
        Task Delete(long id);
    }
}
