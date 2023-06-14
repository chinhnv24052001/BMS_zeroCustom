using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment5.Dto;

namespace tmss.BMS.Master.Segment5
{
    public interface IBmsMstSegment5AppService : IApplicationService
    {
        Task<PagedResultDto<MstSegment5Dto>> getAllSegment5(SearchSegment5Dto searchSegment3Dto);
        Task<ValSegment5Dto> Save(InputSegment5Dto inputSegment3Dto);
        Task Delete(long id);
        Task<InputSegment5Dto> LoadById(long id);
    }
}
