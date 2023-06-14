using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.PairingSegment.Dto;
using tmss.BMS.Master.Segment1.Dto;

namespace tmss.BMS.Master.PairingSegment  
{
    public interface IBmsMstPairingSegmentAppService : IApplicationService
    {
        Task<PagedResultDto<BmsMstPairingSegmentDto>> getAllPairingSegment(SearchPairingDto searchPairingDto);
        Task<ValPairingSegmentDto> Save(InputPairingSegmentDto inputPairingSegmentDto);
        Task Delete(long id);
        Task<InputPairingSegmentDto> LoadById(long id);
    }
}
