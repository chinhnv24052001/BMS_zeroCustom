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
    public interface IBmsMstSegment4GroupAppService : IApplicationService
    {
       Task<List<MstSegment4GroupDto>>  GetListSegment4Groups(); //Da xong

        Task<PagedResultDto<MstSegment4GroupDto>> getAllSegment4Group(SearchSegment4GroupDto searchSegment4GroupDto);
        Task<ValSegment4Dto> Save(InputSegment4GroupDto inputSegment4GroupDto);
        Task Delete(long id);
        Task<InputSegment4GroupDto> LoadById(long id);
    }
}
