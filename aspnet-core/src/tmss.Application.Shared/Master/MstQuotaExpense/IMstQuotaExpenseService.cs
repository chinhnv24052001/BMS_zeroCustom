using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.Master.Dto;
using tmss.Master.MstQuotaExpense.DTO;

namespace tmss.Master
{
    public interface IMstQuotaExpenseAppService : IApplicationService
    {
        Task<PagedResultDto<MstQuotaExpenseDto>> getMstQuotaExpenseSearch(InputSearchMstQuotaExpense input);
        Task<List<MstQuotaExpenseDto>> getMstQuotaExpenseById(decimal p_id);
        Task<string> MstQuotaExpenseInsert(MstQuotaExpenseDto dto);
        Task<string> MstQuotaExpenseUpdate(MstQuotaExpenseDto dto);
        Task<byte[]> MstQuotaExpenseExportExcel(InputExportQuotaExpenseDto input);
    }
}
