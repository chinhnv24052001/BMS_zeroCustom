using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.InventoryItems.Dto;

namespace tmss.Master.InventoryItems
{
    public interface IMstInventoryItemSubInventoriesAppService : IApplicationService
    {
        Task<List<GettemsSubInventoriesDto>> getAllItemSubInventories(SearchtemsSubInventoriesDto searchInvItemsDto);
    }
}
