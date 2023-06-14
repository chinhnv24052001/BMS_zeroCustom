using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment2.Dto;

namespace tmss.BMS.Master.Segment2
{
    public interface IBmsMstSegment2AppService : IApplicationService
    {
        Task<PagedResultDto<MstSegment2Dto>> getAllSegment2(SearchSegment2Dto searchSegment2Dto);
        Task<ValSegment2Dto> Save(InputSegment2Dto inputSegment3Dto);
        Task Delete(long id);
        Task<InputSegment2Dto> LoadById(long id);
    }
}
