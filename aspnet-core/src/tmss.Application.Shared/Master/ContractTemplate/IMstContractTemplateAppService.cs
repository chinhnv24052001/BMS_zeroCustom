using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.ContractTemplate.Dto;
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.PurchasePurpose.Dto;

namespace tmss.Master.ContractTemplate
{
    public interface IMstContractTemplateAppService : IApplicationService
    {
        Task<PagedResultDto<GetContractTemplateDto>> getAllContractTemplate(InputSearchContractTemplateDto inputSearchContractTemplate);
        Task<long> Save(InputContractTemplateDto input);
        Task DeleteContractTemplate(long id);
        Task<InputContractTemplateDto> LoadById(long id);
    }
}
