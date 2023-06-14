using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.Master.Dto;
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.MstQuotaExpense.DTO;
using tmss.Master.ProcessType.Dto;

namespace tmss.Master
{
    public interface IMstDocumentAppService : IApplicationService
    {
        Task<PagedResultDto<MstDocumentDto>> getMstDocumentSearch(InputSearchMstDocument input);     
        Task<string> MstDocumentInsert(MstDocumentDto dto);
        Task<string> MstDocumentUpdate(MstDocumentDto dto);
        Task<byte[]> MstDocumentExportExcel(InputDocumentDto input);
        Task<List<MasterLookupDto>> MstInventoryGroupGetAll ();
        Task<List<ProcessTypeGetAllOutputDto>> MstPRoductTypeGetAll();


    }
}
