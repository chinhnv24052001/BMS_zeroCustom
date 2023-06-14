using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.Master.Dto;
using tmss.Master.Project.DTO;

namespace tmss.Master
{
    public interface IMstProductGroupAppService : IApplicationService
    {
        Task<PagedResultDto<MstProductGroupDto>> getProductGroupSearch(InputSearchMstProuctGroup input);
        Task<string> MstProductGroupInsert(MstProductGroupDto dto);
        Task<string> MstProductGroupUpdate(MstProductGroupDto dto);
        Task<byte[]> MstProductGroupExportExcel(InputProductGroupDto input);
        Task<List<MstProductGroupDto>> MstProductGroupGetParentId(long p_id);

    }
}
