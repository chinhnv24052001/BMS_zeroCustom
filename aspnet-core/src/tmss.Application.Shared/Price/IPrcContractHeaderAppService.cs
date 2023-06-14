using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Price.Dto;

namespace tmss.Price
{
    public interface IPrcContractHeaderAppService
    {
        Task<PagedResultDto<GetAllContractHeaderDto>> GetAllData(SearchInputDto searchInputDto);
        //Task<List<GetAttachFileDto>> GetListAttachFileData(long prcContractHeaderId);
        Task<long> CreateOrEdit(GetAllContractHeaderDto input);
        //Task DeleteContractAttachFile(long inputId);
        GetAllContractHeaderDto GetContractDataById(long id);
    }
}
