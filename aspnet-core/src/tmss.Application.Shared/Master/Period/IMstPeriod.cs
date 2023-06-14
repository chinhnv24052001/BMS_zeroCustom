using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Linq.Dynamic.Core;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Period.Dto;

namespace tmss.Master.Period
{
    public interface IMstPeriod : IApplicationService
    {
        Task<PagedResultDto<ListPeriodDto>> LoadAllPeriod(InputSearchMstPeriodDto inputSearchMstPeriodDto);
        Task<bool> CheckGlDate(DateTime glDate);
    }
}
