using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Supplier.Dto;
using tmss.Master.SupplierRequest.Dto;
using tmss.Master.UnitOfMeasure.Dto;

namespace tmss.Master.SupplierRequest
{
    public interface IMstSupplierRequestAppService : IApplicationService
    {
        Task<PagedResultDto<SupplierRequestInfoDto>> GetAllSupplier(SupplierRequestInput input);
        Task<SupplierRequestInfoDto> GetSupplierByGuId(Guid requestUniqueId);
        Task<long?> CreateOrEditSupplierRequest(SupplierRequestInfoDto dto);
        Task Approve(SupplierRequestInfoDto dto);
        Task DeleteSupplierRequest(long id);
        Task<SupplierRequestInfoDto> GetSupplierRequestById(long id);
        Task ResentEmailToUser(SupplierRequestInfoDto dto);

    }
}
