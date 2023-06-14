using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.Master.Dto;
namespace tmss.Master
{
    public interface IMstProjectAppService : IApplicationService
    {
        Task<PagedResultDto<MstProjectDto>> getMstProjectSearch(InputSearchMstProject input);
        Task<List<MstProjectDto>> getMstProjectById(decimal p_id);
        Task<string> MstProjectInsert(MstProjectDto dto);
        Task<string> MstProjectUpdate(MstProjectDto dto);
        Task<byte[]> MstProjectExportExcel(InputExportProjectDto input);

    }
}
