using Abp.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.ImpInventoryItemPrice;
using tmss.Master.InventoryItemTemp;

namespace tmss.Master.ImpInventoryItemPrice
{
    public class ImpInventoryItemPriceTempAppService : tmssAppServiceBase, IImpInventoryItemPriceTemp
    {
        private readonly IRepository<ImpInventoryItemPriceTemp, long> _impInventoryItemPriceTemp;
        public ImpInventoryItemPriceTempAppService(
            IRepository<ImpInventoryItemPriceTemp, long> impInventoryItemPriceTemp
            )
        {
            _impInventoryItemPriceTemp = impInventoryItemPriceTemp;
        }
        public Task<List<ImpInventoryItemPriceTempDto>> getAllInventoryItemsByGroup(List<ImpInventoryItemPriceTempDto> searchInvItemsDto)
        {

            throw new NotImplementedException();
        }
    }
}
