using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Supplier.Dto;
using tmss.Master.UnitOfMeasure.Dto;

namespace tmss.Master.Supplier
{
    public interface IMstSupplierAppService : IApplicationService
    {
        Task<PagedResultDto<SupplierOutputSelectDto>> GetAllSupplier(SupplierInputSearchDto supplierInputSearchDto);
        Task<PagedResultDto<SupplierSiteOutputSelectDto>> GetAllSupplierSiteBySupplierId(SupplierSiteInputSearchDto supplierSiteInputSearchDto);
        Task<List<SupplierSiteOutputSelectDto>> GetAllSupplierSiteBySupplierIdNotPaged(SupplierSiteInputSearchNotPagedDto supplierSiteInputSearchNotPagedDto);
        Task<PagedResultDto<SupplierContacOutputSelectDto>> GetAllSupplierContactBySupplierSiteId(SupplierContactInputSearchDto supplierSiteInputSearchDto);

        //Thao tac voi supplier contact
        Task Save(SupplierContactSaveDto supplierContactSaveDto);
        Task<SupplierContactSaveDto> LoadById(long id);

        Task<List<SupplierOutputSelectDto>> GetAllSupplierNotPaged(SupplierInputSearchNotPagedDto supplierInputSearchNotPagedDto);


        //Supplier
        Task<ValSupplierSaveDto> SaveSupplier(SupplierSaveDto supplierSaveDto);
        Task DeleteSupplier(long id);
        Task<SupplierSaveDto> LoadSupplierById(long id);


        //Supplier site
        Task SaveSite(SupplierSiteSaveDto supplierSiteSaveDto);
        Task DeleteSite(long id);
        Task<SupplierSiteSaveDto> LoadSiteById(long id);
    }
}
