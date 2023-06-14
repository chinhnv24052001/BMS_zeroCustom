using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.ExchangeRateMaster.Dto;
using tmss.BMS.Master.ProjectCode.Dto;
using tmss.Dto;

namespace tmss.BMS.Master.ProjectCode 
{
    public interface IProjectCodeAppService : IApplicationService
    {
        Task<PagedResultDto<BmsMstProjectCodeDto>> getAllProjectCode(SearchProjectCodeDto searchProjectCodeDto);
        Task<ValProjectCodeDto> Save(InputProjectCodeDto inputProjectCodeDto);
        Task Delete(long id);
        Task<InputProjectCodeDto> LoadById(long id);
        Task<ValProjectCodeMultipleSave> SaveMultiple(SaveMultipleProjectCodeDto saveMultipleProjectCodeDto);
    }
}
