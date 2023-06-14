using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.ImportExcel.PurchasePurpose.Dto;
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.PurchasePurpose.Dto;

namespace tmss.Master.PurchasePurpose
{
    public interface IMstPurchasePurposeAppService : IApplicationService
    {
        Task<PagedResultDto<GetPurchasePurposeDto>> getAllPurchasePurpose(SearchPurchasePurposeDto searchPurchasePurposeDto);
        Task<ValInventoryGroupDto> Save(InputPurchasePurposeDto inputPurchasePurposeDto);
        Task SaveAllImport(List<PurchasePurposeImportDto> listPurchasePurposeImportDto);
        Task DeletePurpose(long id);
        Task<InputPurchasePurposeDto> LoadById(long id);
    }
}
