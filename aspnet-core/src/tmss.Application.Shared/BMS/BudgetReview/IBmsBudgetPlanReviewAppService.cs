using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.BudgetReview.Dto;
using tmss.BMS.Master.ExchangeRateMaster.Dto;

namespace tmss.BMS.BudgetReview
{
    public interface IBmsBudgetPlanReviewAppService: IApplicationService
    {
        Task<PagedResultDto<BmsBudgetPlanReviewDto>> GetAllBudgetPlanReview(SearchBudgetPlanReviewDto input);
        //Task Save(InputExchangeRateDto inputExchangeRateDto);
    }
}
