using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Threading.Tasks;
using tmss.RequestApproval.Dto;

namespace tmss.RequestApproval
{
    public interface IRequestApprovalAppService : IApplicationService
    {
        Task<PagedResultDto<RequestApprovalSearchOutputDto>> Search(RequestApprovalSearchInputDto input);
        Task<string> RequestOrReplyInfo(long stepId, string requestNote, string replyNote);
        Task ReplyFromHeader(long headerId, string replyNote);
    }
}
