using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Enum;
using tmss.BMS.Master.ExchangeRateMaster.Dto;
using tmss.BMS.Master.Segment1.Dto;

namespace tmss.BMS.Master.ExchangeRateMaster
{
    public interface IExchangeRateMasterAppService : IApplicationService
    {
        Task<PagedResultDto<MstExchangeRateDto>> getAllExchangeRate(SearchExchangeRateDto searchExchangeRateDto);
        Task Save(InputExchangeRateDto inputExchangeRateDto);
        Task Delete(long id);
        Task<InputExchangeRateDto> LoadById(long id);
        Task SyncBMSEnum(BmsMstColumn id);
    }
}
