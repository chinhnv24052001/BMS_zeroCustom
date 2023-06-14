using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Threading.Tasks;
using tmss.GR.Dto;

namespace tmss.GR
{
    public interface IRcvShipmentHeadersAppService : IApplicationService
    {
        //Task<PagedResultDto<ExpectedReceiptsDto>> getAllExpectedReceipts(SearchExpectedReceiptsDto searchInput);
        Task<PagedResultDto<ExpectedReceiptsDto>> getAllExpectedReceipts_Store(SearchExpectedReceiptsDto input);
        Task<GetRcvShipmentHeaderForEditDto> getGoodsReceiptById(int id);
        Task<InputRcvShipmentHeadersDto> createGoodsReceipt(InputRcvShipmentHeadersDto inputRcvShipmentHeaderDto);
        Task<PagedResultDto<GetRcvShipmentLineForEditDto>> getGoodsReceiptDetail(int id); 
        Task<int> CancelReceipt(long id);
    }
}
