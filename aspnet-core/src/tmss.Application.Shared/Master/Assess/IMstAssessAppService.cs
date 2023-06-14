using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Assess.Dto;
using tmss.Master.CancelReason.Dto;
using tmss.Master.ContractTemplate.Dto;

namespace tmss.Master.Assess.Dto
{
    public interface IMstAssessAppService : IApplicationService
    {
        Task<PagedResultDto<AssessInfoDto>> GetAssessDataInfo(AssessSearchInput input);
        Task<PagedResultDto<AssessGroupInfoDto>> GetAssessGroupDataInfo(AssessSearchInput input);
        //Task<PagedResultDto<InputCancelReasonDto>> getAllCancelReason(InputSearchCancelReasonDto inputSearchCancelReasonDto);
        Task CreateOrEditAssess(AssessInfoDto input);
        Task DeleteAssess(long id);
        Task CreateOrEditAssessDetail(AssessDetailInfoDto input);
        Task DeleteAssessDetail(long id);
        Task<List<AssessDetailInfoDto>> GetAssessGroupDetailDataInfo(long? assessGroupId);
        Task CreateOrEditAssessGroup(AssessGroupInfoDto input);
        Task DeleteAssessGroup(long id);

    }
}
