using Abp.Application.Services;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tmss.Dashboard.MainDashboard;
using tmss.Dashboard.MainDashboard.Dto;
using tmss.RequestApproval;

namespace tmss.MainDashboard
{
    public class PcsMainDashboardAppService : ApplicationService, IPcsMainDashboardAppService
    {
        private readonly IDapperRepository<RequestApprovalStep, long> _dapper;
        private readonly IRepository<DashboardUserFunctions, long> _dashboardUserRepo;
        private readonly IRepository<DashboardFunctions, long> _dashboardFuncRepo;

        public PcsMainDashboardAppService(
            IDapperRepository<RequestApprovalStep, long> dapper,
            IRepository<DashboardUserFunctions, long> dashboardUserRepo,
            IRepository<DashboardFunctions, long> dashboardFuncRepo
        )
        {
            _dapper = dapper;
            _dashboardUserRepo = dashboardUserRepo;
            _dashboardFuncRepo = dashboardFuncRepo;
        }
        public async Task<List<MainDashboardActionsForViewDto>> GetAllDashboardActionForView()
        {
            IEnumerable<MainDashboardActionsForViewDto> actions = await _dapper.QueryAsync<MainDashboardActionsForViewDto>("EXEC sp_PcsQueryDashboardActions @UserId", new { UserId = AbpSession.UserId });

            return actions.ToList();
        }

        //public async Task<List<DashboardInventoryGroupForViewDto>> DashboardSearch()
        //{

        //}

        public async Task<List<GetAllSystemFunctionForViewDto>> GetAllSysFunc()
        {
            return await _dashboardFuncRepo.GetAll().AsNoTracking().Select(e => new GetAllSystemFunctionForViewDto
            {
                Id = e.Id,
                FunctionName = e.FunctionName,
                FunctionKey = e.FunctionKey
            }).ToListAsync();
        }

        public async Task<List<GetAllUserFunctionsForViewDto>> GetAllUserFunctions()
        {
            var result = await (from userf in _dashboardUserRepo.GetAll().Where(e => e.UserId == AbpSession.UserId).AsNoTracking()
                                join func in _dashboardFuncRepo.GetAll().AsNoTracking() on userf.FunctionId equals func.Id
                                orderby userf.Ordering ascending
                                select new GetAllUserFunctionsForViewDto
                                {
                                    Id = userf.Id,
                                    FunctionName = func.FunctionName,
                                    FunctionKey = func.FunctionKey,
                                    FunctionId = func.Id
                                }).ToListAsync();
            return result;
        }

        public async Task CreateUserFunctionList(List<CreateOrEditUserFunctionListInput> input)
        {
            await _dapper.QueryAsync("EXEC sp_DashboardFunctionDelete @UserId", new { @UserId = AbpSession.UserId });

            foreach(var item in input)
            {
                await _dapper.QueryAsync("EXEC sp_DashboardFunctionInsert @UserId, @FunctionId, @Ordering", new { @UserId = AbpSession.UserId, @FunctionId = item.FunctionId, @Ordering = item.Ordering });
            }
        }
    }
}
