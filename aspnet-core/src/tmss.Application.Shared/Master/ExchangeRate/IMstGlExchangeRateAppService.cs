using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Catalog.Dto;
using tmss.Master.ExchangeRate.Dto;

namespace tmss.Master.ExchangeRate
{
    public interface IMstGlExchangeRateAppService
    {
        Task<PagedResultDto<SearchOutputDto>> GetAllData(GetSearchInput input);
        Task CreateOrEdit(SearchOutputDto dto);
        Task Delete(long id);
        Task<byte[]> MstGlExchangeRateExportExcel(InputMstGlExchangeRateExportDto input);
    }
}
