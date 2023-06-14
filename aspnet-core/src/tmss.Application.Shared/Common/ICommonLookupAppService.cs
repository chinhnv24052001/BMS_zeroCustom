using System.Collections.Generic;
using System.Threading.Tasks;
using Abp.Application.Services;
using Abp.Application.Services.Dto;
using tmss.Common.Dto;
using tmss.Editions.Dto;
using tmss.Price.Dto;

namespace tmss.Common
{
    public interface ICommonLookupAppService : IApplicationService
    {
        Task<ListResultDto<SubscribableEditionComboboxItemDto>> GetEditionsForCombobox(bool onlyFreeItems = false);

        Task<PagedResultDto<NameValueDto>> FindUsers(FindUsersInput input);

        GetDefaultEditionNameOutput GetDefaultEditionName();
        Task SaveAttachFileToDb(GetAttachFileDto input);
        Task<GetAttachFileDto> GetAttachFileData(long headerId, string type);
        Task DeleteAllAttachmentByConTractId(long contractId);
    }
}