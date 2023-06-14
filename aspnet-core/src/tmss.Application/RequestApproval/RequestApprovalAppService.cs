using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Authorization.Users;
using tmss.RequestApproval.Dto;

namespace tmss.RequestApproval
{
    public class RequestApprovalAppService : ApplicationService, IRequestApprovalAppService
    {
        private readonly IRepository<RequestApprovalStep, long> _stepRepo;
        private readonly IRepository<User, long> _userRepo;
        private readonly IDapperRepository<RequestApprovalStep, long> _dapper;

        public RequestApprovalAppService(
            IRepository<RequestApprovalStep, long> stepRepo,
            IRepository<User, long> userRepo,
            IDapperRepository<RequestApprovalStep, long> dapper
            )
        {
            _stepRepo = stepRepo;
            _userRepo = userRepo;
            _dapper = dapper;
        }

        [AbpAuthorize(AppPermissions.ApprovalManagement_Search)]
        public async Task<PagedResultDto<RequestApprovalSearchOutputDto>> Search(RequestApprovalSearchInputDto input)
        {
            IEnumerable<RequestApprovalSearchOutputDto> userRequests = await _dapper.QueryAsync<RequestApprovalSearchOutputDto>
                ("EXEC sp_GetAllRequestApprovalByUser  @ApprovalUserId, @ApprovalStatus,@RequestTypeId, @RequestNo, @SendDateFrom, @SendDateTo, @SkipCount, @MaxResultCount",
                new
                {
                    input.ApprovalUserId,
                    input.ApprovalStatus,
                    input.RequestTypeId,
                    input.RequestNo,
                    input.SendDateFrom,
                    input.SendDateTo,
                    input.SkipCount,
                    input.MaxResultCount
                });

            var result = userRequests.AsQueryable();

            var totalCount = result.ToList().Count > 0 ? result.ToList()[0].TotalCount : 0;

            return new PagedResultDto<RequestApprovalSearchOutputDto>(
                totalCount,
                result.ToList()
                );
        }

        public async Task<string> RequestOrReplyInfo(long stepId, string requestNote, string replyNote )
        {
            var step = await _stepRepo.FirstOrDefaultAsync(e => e.Id == stepId);
            var currentUser = await _userRepo.FirstOrDefaultAsync(e => e.Id == AbpSession.UserId);
            if(step != null)
            {
                if(!string.IsNullOrWhiteSpace(replyNote)) step.ReplyNote = ((currentUser != null && !string.IsNullOrWhiteSpace(currentUser.FullName)) ? (currentUser.FullName + ":") : "") + replyNote;
                if (!string.IsNullOrWhiteSpace(requestNote)) step.RequestNote = ((currentUser != null && !string.IsNullOrWhiteSpace(currentUser.FullName)) ? (currentUser.FullName + ":") : "" ) +  requestNote ;
            }
            await CurrentUnitOfWork.SaveChangesAsync();
            return step.RequestNote;
        }

        public async Task ReplyFromHeader(long headerId, string replyNote)
        {
            var steps = await _stepRepo.GetAll().Where(e => e.ReqId == headerId && !string.IsNullOrWhiteSpace(e.RequestNote)).ToListAsync();
            var currentUser = await _userRepo.FirstOrDefaultAsync(e => e.Id == AbpSession.UserId);
            if (steps != null)
            {
                foreach (var step in steps)
                {
                    if (!string.IsNullOrWhiteSpace(replyNote)) step.ReplyNote = ((currentUser != null && !string.IsNullOrWhiteSpace(currentUser.FullName)) ? (currentUser.FullName + ":") : "") + replyNote;
                }
            }
            
            
            await CurrentUnitOfWork.SaveChangesAsync();
        }

    }
}
