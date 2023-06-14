using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.ImpInventoryItemPrice;

namespace tmss.Master.ImpInventoryItemPrice
{
    public interface IImpInventoryItemPriceTemp :  IApplicationService
    {
        Task<List<ImpInventoryItemPriceTempDto>> getAllInventoryItemsByGroup(List<ImpInventoryItemPriceTempDto> searchInvItemsDto);
    }
}
