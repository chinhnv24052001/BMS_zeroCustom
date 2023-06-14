using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using tmss.Dto;
using tmss.PO.PurchaseOrders.Dto;
using tmss.PR.PurchasingRequest.Dto;
using tmss.UR.UserRequestManagement.Dto;

namespace tmss.PO.PurchaseOrders
{
    public interface IPurchaseOrdersAppService : IApplicationService
    {
        Task<long> createPurchaseOrders(InputPurchaseOrdersHeadersDto inputPurchaseOrdersHeadersDto);

        Task<PagedResultDto<GetPurchaseOrdersDto>> getAllPurchaseOrders(InputSearchPoDto inputSearchPoDto);
        Task<List<GetListPoNumberDto>> createPOFromPR(List<GetPurchaseRequestForCreatePODto> getPurchaseRequestForCreatePODtos, string descriptions);
        Task<List<GetListPoNumberDto>> createPoFromUr(List<GetAllUserRequestForPrDto> getAllUserRequestForPrDtos);
        Task<List<GetListPoNumberDto>> addPrToPoExist(List<GetPurchaseRequestForCreatePODto> getPurchaseRequestForCreatePODtos, long poId);
        Task<GetPoHeadersForEditDto> getPoHeadersForEdit(long id);

        Task<int> saveDataFromImportData();

        Task<FileDto> ExportTemplate();

        Task<PagedResultDto<GetContractForCreatePoDto>> getAllContractForCreatePo(InputSearchContractDto inputSearchContractDto);
        Task<FileDto> exportPo(InputSearchPoDto inputSearchPoDto);
        Task supplierComfirm(List<long> listIdPo, long type, string note);

        Task deletePurchaseOrders(long id);

        Task<List<GetListPoForAddPrToPoDto>> getListPoForAddPrToPos(string poNumber);

    }
}
