using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment1.Dto;

namespace tmss.BMS.Master.Segment1
{
    public interface IBmsMstSegment1AppService : IApplicationService
    {
        Task<PagedResultDto<MstSegment1Dto>> getAllSegment1(SearchSegment1Dto searchSegment1Dto);
        Task<ValSegment1SaveDto> Save(InputSegment1Dto inputSegment1Dto);
        Task Delete(long id);
        Task<InputSegment1Dto> LoadById(long id);
    }
}
