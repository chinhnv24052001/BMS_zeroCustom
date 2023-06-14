using Abp.Application.Services;
using Abp.Dependency;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.PR.PurchasingRequest.Dto;

namespace tmss.PR.PurchasingRequest
{
    public interface IImportPrImportExcelDataReaderAppService : IApplicationService
    {
        Task<List<ImportPrDto>> GetImportPrFromExcel(byte[] data);

    }
}
