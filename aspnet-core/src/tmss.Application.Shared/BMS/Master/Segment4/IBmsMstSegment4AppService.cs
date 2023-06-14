using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment2.Dto;
using tmss.BMS.Master.Segment4.Dto;

namespace tmss.BMS.Master.Segment4
{
    public interface IBmsMstSegment4AppService : IApplicationService
    {
        Task<PagedResultDto<MstSegment4Dto>> getAllSegment4(SearchSegment4Dto searchSegment4Dto);
        Task<ValSegment4Dto> Save(InputSegment4Dto inputSegment4Dto);
        Task Delete(long id);
        Task<InputSegment4Dto> LoadById(long id);
    }
}
