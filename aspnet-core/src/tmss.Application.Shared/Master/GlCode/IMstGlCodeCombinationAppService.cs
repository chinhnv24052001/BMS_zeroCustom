using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.ExchangeRate.Dto;
using tmss.Master.GlCode.Dto;

namespace tmss.Master.GlCode
{
    public interface IMstGlCodeCombinationAppService
    {
        Task<PagedResultDto<SearchGlCodeOutputDto>> GetAllData(SeachGlCodeInputDto seachGlCodeInputDto  );
    }
}
