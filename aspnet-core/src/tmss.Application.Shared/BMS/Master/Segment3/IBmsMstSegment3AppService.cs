using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment2.Dto;
using tmss.BMS.Master.Segment3.Dto;

namespace tmss.BMS.Master.Segment3
{
    public interface IBmsMstSegment3AppService : IApplicationService
    {
        Task<PagedResultDto<MstSegment3Dto>> getAllSegment3(SearchSegment3Dto searchSegment3Dto);
        Task<ValSegment3Dto> Save(InputSegment3Dto inputSegment3Dto);
        Task Delete(long id);
        Task<InputSegment3Dto> LoadById(long id);
        Task<List<DivisionSelectDto>> GetAllDivisionNoPage();
        Task<List<DepartmentSelectDto>> GetAllDepartmentByDevisionNoPage(long divisionId);
    }
}
