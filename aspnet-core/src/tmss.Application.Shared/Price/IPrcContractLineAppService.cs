using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.InventoryItems.Dto;
using tmss.Price.Dto;

namespace tmss.Price
{
    public interface IPrcContractLineAppService
    {
        Task<List<GetContactLineByIdOutputDto>> GetByHeaderId(long PrcContractHeaderId );
        Task SaveToTempTable(List<ImpInventoryItemPriceDto> inputData);
        Task<List<ImpInventoryItemPriceDto>> ImportAndGetData(long headerId);
    }
}
