using Abp.Application.Services.Dto;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization.Users;
using tmss.BMS.Master.Segment3;
using tmss.BMS.Master.Segment4;
using tmss.BMS.Master.Segment5;
using tmss.BMS.Master.UserControl.Dto;
using tmss.Core.BMS.Master.Period;
using tmss.InvoiceModule.Dto;
using tmss.Master.Dto;

namespace tmss.BMS.Master.UserControl
{
    public class BmsBudgetUserControlAppService : tmssAppServiceBase, IBmsBudgetUserControlAppService
    {
        private readonly IRepository<BmsMstSegment3, long> _mstSegment3Repository;
        private readonly IRepository<BmsMstPeriod, long> _mstPeriodRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly IRepository<BmsBudgetUserControl, long> _bmsBudgetUserControlRepository;
        private readonly IDapperRepository<User, long> _dapper;
        public BmsBudgetUserControlAppService(IRepository<BmsMstSegment3, long> mstSegment3Repository,
            IRepository<BmsMstPeriod, long> mstPeriodRepository,
            IRepository<User, long> userRepository,
            IRepository<BmsBudgetUserControl, long> bmsBudgetUserControlRepository,
            IDapperRepository<User, long> dapper)
        {
            _mstSegment3Repository = mstSegment3Repository;
            _mstPeriodRepository = mstPeriodRepository;
            _userRepository = userRepository;
            _bmsBudgetUserControlRepository = bmsBudgetUserControlRepository;
            _dapper = dapper;
        }

        public async Task<BudgetControlOutputDto> getAllBudgetForUserCheckBudget(long userId, int manageType)
        {
            string _sql = "EXEC sp_BmsGetAllBudgetForControl @p_userId, @p_type";
            var list = (await _dapper.QueryAsync<UserBudgetControlDto>(_sql, new
            {
                p_userId = userId,
                p_type = manageType,   //0.Quan ly user - 1.Quan ly group
            })).ToList();
            var result = new BudgetControlOutputDto();
            var listRight = new List<UserBudgetControlDto>();
            var listLeft = new List<UserBudgetControlDto>();
            foreach(var item in list)
            {
                if(item.IsCheck)
                {
                    listLeft.Add(item);
                }
                else
                {
                    listRight.Add(item);
                }
            }

            result.listLeft = listLeft;
            result.listRight = listRight;
            return result;
        }

        public async Task<List<UserChechBudgetDto>> getAllUserNoPage()
        {
            string _sql = "EXEC sp_BmsGetAllUserForBudgetControl";
            var list = (await _dapper.QueryAsync<UserChechBudgetDto>(_sql, null)).ToList();
            return list;
        }

        public async Task SaveUser(BmsUserRoleDto bmsUserRoleDto)
        {
            var user = await _userRepository.FirstOrDefaultAsync(bmsUserRoleDto.UserId);
            if (user != null)
            {
                user.IsFinanceMA = bmsUserRoleDto.IsFinanceMA == null ? false : bmsUserRoleDto.IsFinanceMA;
                user.IsGroupManageRight = bmsUserRoleDto.IsGroupManageRight == null ? false : bmsUserRoleDto.IsGroupManageRight;
                await _userRepository.UpdateAsync(user);
                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }

        public async Task SetUserControlBudget (InputSetUserControlBudgetDto inputSetUserControlBudgetDto)
        {
            BmsBudgetUserControl bmsBudgetUserControl = new BmsBudgetUserControl();

            if(inputSetUserControlBudgetDto.ListBudgetId != null)
            {
                var userControlEnum = _bmsBudgetUserControlRepository.GetAll().Where(p => p.UserId == inputSetUserControlBudgetDto.UserId && p.ManageType == inputSetUserControlBudgetDto.ManageType).ToList();
                foreach (var item in userControlEnum)
                {
                    await Delete(item.Id);
                }

                foreach (var item in inputSetUserControlBudgetDto.ListBudgetId)
                {
                    bmsBudgetUserControl = new BmsBudgetUserControl();
                    bmsBudgetUserControl.Id = 0;
                    bmsBudgetUserControl.UserId = inputSetUserControlBudgetDto.UserId;
                    bmsBudgetUserControl.BudgetId = item;
                    bmsBudgetUserControl.ManageType = inputSetUserControlBudgetDto.ManageType.Value;
                    bmsBudgetUserControl.PeriodId = 0;
                    await _bmsBudgetUserControlRepository.InsertAsync(bmsBudgetUserControl);
                }
            }
        }
      
        public async Task Delete(long id)
        {
             await _bmsBudgetUserControlRepository.DeleteAsync(id);
        }

         
    }
}
