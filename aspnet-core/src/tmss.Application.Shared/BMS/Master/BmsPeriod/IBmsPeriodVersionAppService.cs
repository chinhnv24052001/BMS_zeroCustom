using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.BmsPeriod.Dto;

namespace tmss.BMS.Master.BmsPeriod
{
    public interface IBmsPeriodVersionAppService : IApplicationService
    {
        Task<PagedResultDto<BmsPeriodVersionDto>> getAllVersionByPeriodId(SearchPeriodVersionDto searchPeriodVersionDto);
        Task<ValPeriodSaveDto> Save(InputPeriodVersionDto inputPeriodVersionDto);
        Task Delete(long id);
        Task<InputPeriodVersionDto> LoadById(long id);
        Task<byte[]> GetPeriodVersionToExcel(SearchPeriodVersionDto searchPeriodVersionDto);
    }
}
