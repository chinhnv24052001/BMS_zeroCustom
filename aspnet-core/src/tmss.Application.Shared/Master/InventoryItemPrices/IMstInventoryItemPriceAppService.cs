using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.InventoryItemPrices.Dto;

namespace tmss.Master.InventoryItemPrices
{
    public interface IMstInventoryItemPriceAppService
    {
        Task<PagedResultDto<GetByInventoryItemOutputDto>> GetByInventoryItem(long InventoryItemId);
    }
}
