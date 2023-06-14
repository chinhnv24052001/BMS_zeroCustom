using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.UserControl.Dto;

namespace tmss.BMS.Master.UserControl
{
    public interface IBmsBudgetUserControlAppService : IApplicationService
    {
        Task<List<UserChechBudgetDto>> getAllUserNoPage();
        Task<BudgetControlOutputDto> getAllBudgetForUserCheckBudget(long userId, int manageType);
    }
}
