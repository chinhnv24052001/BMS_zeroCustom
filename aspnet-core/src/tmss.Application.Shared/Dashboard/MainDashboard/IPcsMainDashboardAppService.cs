using Abp.Application.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.Dashboard.MainDashboard.Dto;

namespace tmss.Dashboard.MainDashboard
{
    public interface IPcsMainDashboardAppService : IApplicationService
    {
        Task<List<MainDashboardActionsForViewDto>> GetAllDashboardActionForView();
        Task<List<GetAllSystemFunctionForViewDto>> GetAllSysFunc();
    }
}
