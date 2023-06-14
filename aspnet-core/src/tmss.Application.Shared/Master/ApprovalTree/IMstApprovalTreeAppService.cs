using Abp.Application.Services.Dto;
using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.UnitOfMeasure.Dto;
using tmss.Master.ApprovalTree.Dto;

namespace tmss.Master.ApprovalTree
{
    public interface IMstApprovalTreeAppService : IApplicationService
    {
        Task<PagedResultDto<ApprovalTreeOutputSelectDto>> getAllApproval(ApprovalTreeInputSearchDto approvalTreeInputSearchDto);
        Task<ApprovalTreeDetailSelectDto> getDetailApprovalTree(long Id);
        Task Delete(long id);
        Task<ApprovalTreeSaveDto> LoadById(long id);
        Task<string> Save(ApprovalTreeSaveDto approvalTreeSaveDto);
    }
}

