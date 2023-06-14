using Abp.Application.Services.Dto;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization.Users;
using tmss.BMS.BudgetPIC;
using tmss.BMS.BudgetPIC.Dto;
using tmss.BMS.BudgetReview.Dto;
using tmss.BMS.Master.PairingSegment;
using tmss.BMS.Master.Segment3;
using tmss.BMS.Master.Status;
using tmss.BMS.Master.UserControl;
using tmss.Core.BMS.Master.Period;
using tmss.Master.BMS.Department;

namespace tmss.BMS.BudgetReview
{
    public class BmsBudgetPlanReviewAppService : tmssAppServiceBase, IBmsBudgetPlanReviewAppService
    {
        private readonly IRepository<BmsMstPeriod, long> _mstPeriodRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly IDapperRepository<User, long> _dapper;
        public BmsBudgetPlanReviewAppService(
            IRepository<BmsMstPeriod, long> mstPeriodRepository,
             IRepository<User, long> userRepository,
             IDapperRepository<User, long> dapper)
        {
            _mstPeriodRepository = mstPeriodRepository;
            _userRepository = userRepository;
            _dapper = dapper;
        }

        public async Task<List<BmsColumnDto>> GetAllColumnByVersionId(long id)
        {
            string _sql = @"EXEC sp_Bms_GetAllColumnByVersionId
                            @PeriodVersionId";
            var list = (await _dapper.QueryAsync<BmsColumnDto>(_sql, new
            {
                @PeriodVersionId = id
            }));

            return list.ToList();
        }

        public Task<PagedResultDto<BmsBudgetPlanReviewDto>> GetAllBudgetPlanReview(SearchBudgetPlanReviewDto input)
        {
            throw new NotImplementedException();
        }
    }
}
