using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Price.Dto;

namespace tmss.Price
{
    public interface IPrcContractTemplateAppService : IApplicationService
    {
        Task<List<PrcContractTemplateImportDto>> ImportData(byte[] files);
        Task<PrcContractTemplateImportMultipleDto> ImportMultipleContract(byte[] files);

        Task createRequestBackdate(InputContractBackdateDto inputContractBackdateDto);
    }
}
