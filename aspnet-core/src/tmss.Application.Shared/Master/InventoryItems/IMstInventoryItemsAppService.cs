using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.InventoryItems.Dto;

namespace tmss.Master.InventoryItems
{
    public interface IMstInventoryItemsAppService : IApplicationService
    {
        Task<PagedResultDto<InventoryItemsSearchOutputDto>> searchInventoryItems(InventoryItemsSearchInputDto inventoryItemsSearchInput );
        Task<byte[]> MstInventoryItemsExportExcel(InputInventoryItemsSearchInputDto input);

    }
}
