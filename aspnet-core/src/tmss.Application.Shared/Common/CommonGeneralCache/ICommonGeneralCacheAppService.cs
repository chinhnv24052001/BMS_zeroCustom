using Abp.Application.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.Common.CommonGeneralCache.Dto;
using tmss.Master.GlCode.Dto;
using tmss.Master.InventoryItems.Dto;
using tmss.Master.Locations.Dto;
using tmss.Master.Organizations.Dto;
using tmss.PR.PurchasingRequest.Dto;
using tmss.UR.UserRequestManagement.Dto;

namespace tmss.Common.CommonGeneralCache
{
    public interface ICommonGeneralCacheAppService : IApplicationService
    {
        Task<List<CommonAllInventoryGroup>> GetAllInventoryGroups();
        Task<List<CommonAllSupplier>> GetAllSuppliers();
        Task<List<CommonAllCurrency>> GetAllCurrencies();
        Task<List<CommonAllSupplierSite>> GetAllSupplierSites();
        Task<List<CommonAllSupplierContacts>> GetAllSupplierContact(long supplierSiteId);
        Task<List<GetMstLocationsDto>> getAllLocations();
        Task<List<GetRequesterDto>> getAllUsersInfo();

        Task<List<CommonAllSupplierSite>> GetAllSupplierSitesBySupplerId(long supplierId);
        Task<GetRequesterInfoForViewDto> GetRequesterInfo(long userId);

        Task<List<GetMstOrganizationsDto>> getListOrgzationsByPartNo(string partNo);

        Task<List<GetMstInventoryItemsDto>> getAllInventoryItemsByGroup(SearchInvItemsDto searchInvItemsDto);

        Task<SearchGlCodeOutputDto> getGlCombaination();
        Task<List<CommonGetReferencecs>> getListReference(long id, string type);

        Task<List<CommonLookupDto>> getLookupsBy(string lookupType);
        Task<List<CommonPaymentTermsDto>> getAllPaymentTerms();

        Task<GetRequesterDto> geUserById(long id);
        Task<List<CommonGetGlExchangeRateDto>> getGlExchangeRate(InputGetGlExchangRateDto inputGetGlExchangRateDto);
        Task<List<CommonAllDocument>> getDocumentByProcessType(string processTypeCode);
        Task<List<CommonAllTemplate>> getTemplateContractByInvGroup(long invGroupId);
        Task<List<CommonGetAllCatalogDto>> getAllCatalog();
    }
}
