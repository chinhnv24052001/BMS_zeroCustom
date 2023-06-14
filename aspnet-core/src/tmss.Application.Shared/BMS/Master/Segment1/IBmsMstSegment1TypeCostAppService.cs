using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment1.Dto;

namespace tmss.BMS.Master.Segment1
{
    public interface IBmsMstSegment1TypeCostAppService : IApplicationService
    {
        List<MstSegment1TypeCostDto> GetListSegment1TypeCosts();   //Da xong
        Task<PagedResultDto<TypeCostDto>> getAllTypeCost(SearchTypeCostDto searchTypeCostDto);
        Task<ValSegment1SaveDto> Save(InputTypeCostDto inputTypeCostDto);
        Task Delete(long id);
        Task<InputTypeCostDto> LoadById(long id);
    }
}
