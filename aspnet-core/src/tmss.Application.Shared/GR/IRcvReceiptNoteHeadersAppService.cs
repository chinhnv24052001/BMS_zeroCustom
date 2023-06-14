using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.Common.Dto;
using tmss.GR.Dto;

namespace tmss.GR
{
    public interface IRcvReceiptNoteHeadersAppService : IApplicationService
    {
        Task<PagedResultDto<GetExpectedReceiptNoteLinesDto>> getAllExpectedReceiptNoteLines(SearchExpectedReceiptNotesDto input);
        Task<PagedResultDto<GetRcvReceiptNoteHeadersDto>> getAllReceiptNotes(SearchAllReceiptNotesDto input);
        Task<InputRcvReceiptNoteHeadersDto> createReceiptNotes(InputRcvReceiptNoteHeadersDto inputRcvShipmentHeaderDto);
        Task<List<AbpUserDto>> GetUserList(int? tenantId);
        Task<GetRcvReceiptNoteHeadersDto> getReceiptNoteByIdForView(long id);
        Task<GetRcvReceiptNoteHeadersDto> getReceiptNoteByNumForView(SearchAllReceiptNotesDto input);
        Task<GetRcvReceiptNoteHeaderForEditDto> getReceiptNoteByNumForReceipt(SearchReceiptNotesByNum input);
        Task<GetRcvReceiptNoteHeaderForEditDto> getReceiptNoteByIdForReceipt(List<long> idList); //(long id);


    }
}
