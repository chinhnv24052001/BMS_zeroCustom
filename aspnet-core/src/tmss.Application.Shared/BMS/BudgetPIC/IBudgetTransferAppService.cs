using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.BudgetPIC.Dto;
using tmss.BMS.Master.Segment1.Dto;

namespace tmss.BMS.BudgetPIC
{
    public interface IBudgetTransferAppService
    {
        Task<PagedResultDto<BudgetTransferDto>> getAllBudgetTransfer(SearchBudgetTransferDto input);
        Task Save(InputBudgetTransferDto intput);
        Task Delete(long id);
        Task<InputBudgetTransferDto> LoadById(long id);

    }
}
