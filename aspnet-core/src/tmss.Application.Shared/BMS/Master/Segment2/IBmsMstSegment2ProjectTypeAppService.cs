using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment1.Dto;
using tmss.BMS.Master.Segment2.Dto;

namespace tmss.BMS.Master.Segment2
{
    public interface IBmsMstSegment2ProjectTypeAppService : IApplicationService
    {
        List<MstSegment2ProjectTypeDto> GetListSegment2ProjectTypes();

        Task<PagedResultDto<ProjectTypeDto>> getAllProjectType(SearchProjectTypeDto searchProjectTypeDto);
        Task<ValSegment2Dto> Save(InputProjectTypeDto inputProjectTypeDto);
        Task Delete(long id);
        Task<InputProjectTypeDto> LoadById(long id);
    }
}
