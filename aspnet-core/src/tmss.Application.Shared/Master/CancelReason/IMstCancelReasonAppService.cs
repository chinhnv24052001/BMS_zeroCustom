using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.CancelReason.Dto;
using tmss.Master.ContractTemplate.Dto;

namespace tmss.Master.CancelReason
{
    public interface IMstCancelReasonAppService : IApplicationService
    {
        Task<PagedResultDto<InputCancelReasonDto>> getAllCancelReason(InputSearchCancelReasonDto inputSearchCancelReasonDto);
        Task Save(InputCancelReasonDto input);
        Task DeleteCancelReason(long id);
        Task<InputCancelReasonDto> LoadById(long id);
    }
}
