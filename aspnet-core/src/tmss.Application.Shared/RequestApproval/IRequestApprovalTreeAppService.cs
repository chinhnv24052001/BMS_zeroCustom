using Abp.Application.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.PaymentModule.Payment.Dto;
using tmss.RequestApproval.Dto;

namespace tmss.RequestApproval
{
    public interface IRequestApprovalTreeAppService : IApplicationService
    {
        Task<CreateRequestApprovalOutputDto> CreateRequestApprovalTree(CreateRequestApprovalInputDto createRequestApprovalInputDto);
        Task ConfirmRequestForSending(RequestNextApprovalTreeInputDto requestNextApprovalInputDto);
        Task RequestNextApprovalTree(RequestNextApprovalTreeInputDto requestNextApprovalInputDto);
        Task<ApproveOrRejectOutputDto> ApproveOrReject(ApproveOrRejectInputDto approveOrRejectInputDto   );
        Task<List<RequestApprovalHistoryOutputDto>> GetApprovalRequestHistory(RequestApprovalHistoryInputDto requestApprovalHistoryInputDto);
        Task<bool> Forward(ForwardInputDto forwardInputDto  );
        Task ForwardAndApprove(FowardApproveInputDto fowardApproveInputDto  );
        Task SkipSelectedSteps(string note, List<long> stepIds);
        Task ForwardAndSkip(long stepId, long newUserId,string note);
        Task UndoRequest(long reqId, string processTypeCode);
        Task SaveChangeStepPosition(long stepId, long updateSeq);
        Task AddNewStepToTree(long userId, long reqId, string processTypeCode, long dayOfProcess);
        Task DeleteStep(long stepId);


        // thao tác xử lý nhiều chứng từ (Author : Bachnx)
        Task CheckRequestNextMultipleApprovalTree(string processTypeCode, List<long> reqIds);
        Task AddNewStepToTreeForMulltipleHeader(long userId, string processTypeCode, long dayOfProcess, List<long> reqIds);
        Task SaveChangeStepPositionForMulltipleHeader(long firstSeq, long updateSeq, string processTypeCode, List<long> reqIds);
        Task SentRequestForMultipleHeader(string processTypeCode, List<long> reqIds);
        Task SkipStepForMultipleHeader(string note, long skipSeq, string processTypeCode, List<long> reqIds);
        Task DeleteStepForMultipleHeader(long skipSeq, string processTypeCode, List<long> reqIds);
        Task SkipAndForwardForMultipleHeader(long skipSeq, long newUserId, string note, string processTypeCode, List<long> reqIds);
        Task ApproveOrRejectMUltipleHeader(List<ApproveOrRejectInputDto> steps);
        Task AssignJobToOtherBuyer(string processTypeCode, long reqId, long userId);
        Task<List<GetEmployeesDto>> GetAllBuyerInfo(string filterText);

    }
}
