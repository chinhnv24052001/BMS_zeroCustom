using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Dto;
using tmss.Master.PurchasePurpose.Dto;
using tmss.PR.PurchasingRequest.Dto;
using tmss.UR.UserRequestManagement.Dto;

namespace tmss.PR.PurchasingRequest
{
    public interface IPurchaseRequestAppService : IApplicationService
    {
        Task<PagedResultDto<GetPurchaseRequestDto>> getAllPurchaseRequest(SearchPurchaseRequestDto searchPaymentRequestDto);
        Task<long> createPurchaseRequest(InputPurchaseRequestHeaderDto inputPurchaseRequestHeaderDto);

        Task<GetPurchaseRequestForEditDto> getPurchaseRequestById(int id);

        Task<PagedResultDto<GetRequesterDto>> getListRequester(SearchRequesterDto searchRequesterDto);
        Task deletePurchaseRequest(int id);

        Task<bool> checkAccountDistributions(string account);
        Task<List<GetRequesterDto>> getAllUsers();

        Task<PagedResultDto<GetPurchaseRequestForCreatePODto>> getAllPurchaseRequestForCreatePO(InputSearchAutoCreatePo inputSearchAutoCreatePo);
        Task<FileDto> exportPr(SearchPurchaseRequestDto searchPurchaseRequestDto);
        Task<List<GetPrDistributionsForCreatePoDto>> getPrDistributionsForCreatePO(long prHeaderId);

        Task<int> SaveDataFromImportExcel();

        Task<List<GetListPrNumberDto>> createPrFromUr(List<GetAllUserRequestForPrDto> getAllUserRequestForPrDtos);
        Task updateInventoryGroup(List<GetPurchaseRequestForCreatePODto> getPurchaseRequestForCreatePODtos, long inventoryGroupId);
    }
}
