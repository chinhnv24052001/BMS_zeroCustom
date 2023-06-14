using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.BmsPeriod.Dto;
using tmss.BMS.Master.Segment1.Dto;

namespace tmss.BMS.Master.BmsPeriod
{
    public interface IBmsMstPeriodAppService : IApplicationService
    {
        Task<PagedResultDto<BmsMstPeriodDto>> getAllPeriod(SearchPeriodDto searchPeriodDto);
        Task<ValPeriodSaveDto> Save(InputBmsMstPeriodDto inputBmsMstPeriodDto);
        Task Delete(long id);
        Task<InputBmsMstPeriodDto> LoadById(long id);
        Task<byte[]> GetPeriodToExcel(SearchPeriodDto searchPeriodDto);
    }
}
