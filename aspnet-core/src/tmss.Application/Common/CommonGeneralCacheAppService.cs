using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tmss.Authorization.Users;
using tmss.Common.CommonGeneralCache;
using tmss.Common.CommonGeneralCache.Dto;
using tmss.Master;
using tmss.Master.GlCode.Dto;
using tmss.Master.InventoryItems.Dto;
using tmss.Master.Locations.Dto;
using tmss.Master.Organizations.Dto;
using tmss.PO;
using tmss.PR.PurchasingRequest.Dto;
using tmss.UR.UserRequestManagement.Dto;

namespace tmss.Common
{
    public class CommonGeneralCacheAppService : ApplicationService, ICommonGeneralCacheAppService
    {
        private readonly IRepository<MstInventoryGroup, long> _invenGRepo;
        private readonly IRepository<MstCurrency, long> _curRepo;
        private readonly IRepository<MstSuppliers, long> _supplierRepo;
        private readonly IRepository<MstSupplierSites, long> _supSitesRepo;
        private readonly IRepository<MstLineType, long> _lineTypeRepo;
        private readonly IRepository<MstLocations, long> _mstLocationsRepository;
        private readonly IRepository<MstSupplierContacts, long> _mstSupplierContactsRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly IRepository<MstHrOrgStructure, Guid> _mstHrOrgStructure;
        private readonly IRepository<MstPurchasePurpose, long> _purposeRepo;
        private readonly IRepository<MstTitles, long> _titleRepo;
        private readonly IRepository<MstProcessType, long> _processTypeRepo;
        private readonly IRepository<MstGlCodeCombination, long> _glCodeRepo;
        private readonly IRepository<MstOrganizations, long> _mstMstOrganizationsRepository;
        private readonly IRepository<MstInventoryItems, long> _mstMstInventoryItemsRepository;
        private readonly IDapperRepository<MstInventoryItems, long> _spRepository;
        private readonly IRepository<MstGlCodeCombination, long> _mstGlCodeCombinationRepository;
        private readonly IRepository<MstPaymentTerms, long> _mstPaymentTerms;
        private readonly IRepository<MstLookup, long> _mstLookupRepository;
        private readonly IRepository<MstGlExchangeRate, long> _mstGlExchangeRateRepository;
        private readonly IRepository<MstUnitOfMeasure, long> _uomRepo;
        private readonly IRepository<MstContractTemplate, long> _mstContractTemplateRepo;
        private readonly IRepository<PoLookupCodes, long> _poLookupCodesRepo;
        private readonly IRepository<MstCatalog, long> _mstCatalogRepo;

        public CommonGeneralCacheAppService(
            IRepository<MstInventoryGroup, long> invenGRepo,
            IRepository<MstCurrency, long> curRepo,
            IRepository<MstSuppliers, long> supplierRepo,
            IRepository<MstSupplierSites, long> supSitesRepo,
            IRepository<MstLineType, long> lineTypeRepo,
            IRepository<MstLocations, long> mstLocationsRepository,
            IRepository<MstSupplierContacts, long> mstSupplierContactsRepository,
            IRepository<User, long> userRepository,
            IRepository<MstHrOrgStructure, Guid> mstHrOrgStructure,
            IRepository<MstPurchasePurpose, long> purposeRepo,
            IRepository<MstTitles, long> titleRepo,
            IRepository<MstProcessType, long> processTypeRepo,
            IRepository<MstGlCodeCombination, long> glCodeRepo,
            IRepository<MstOrganizations, long> mstMstOrganizationsRepository,
            IRepository<MstInventoryItems, long> mstMstInventoryItemsRepository,
            IDapperRepository<MstInventoryItems, long> spRepository,
            IRepository<MstGlCodeCombination, long> mstGlCodeCombinationRepository,
            IRepository<MstPaymentTerms, long> mstPaymentTerms,
            IRepository<MstLookup, long> mstLookupRepository,
            IRepository<MstGlExchangeRate, long> mstGlExchangeRateRepository,
            IRepository<MstUnitOfMeasure, long> uomRepo,
            IRepository<MstContractTemplate, long> mstContractTemplateRepo,
            IRepository<PoLookupCodes, long> poLookupCodesRepo,
            IRepository<MstCatalog, long> mstCatalogRepo
            )
        {
            _invenGRepo = invenGRepo;
            _curRepo = curRepo;
            _supplierRepo = supplierRepo;
            _supSitesRepo = supSitesRepo;
            _lineTypeRepo = lineTypeRepo;
            _mstLocationsRepository = mstLocationsRepository;
            _mstSupplierContactsRepository = mstSupplierContactsRepository;
            _userRepository = userRepository;
            _mstHrOrgStructure = mstHrOrgStructure;
            _purposeRepo = purposeRepo;
            _titleRepo = titleRepo;
            _processTypeRepo = processTypeRepo;
            _glCodeRepo = glCodeRepo;
            _mstMstOrganizationsRepository = mstMstOrganizationsRepository;
            _mstMstInventoryItemsRepository = mstMstInventoryItemsRepository;
            _spRepository = spRepository;
            _mstGlCodeCombinationRepository = mstGlCodeCombinationRepository;
            _mstPaymentTerms = mstPaymentTerms;
            _mstLookupRepository = mstLookupRepository;
            _mstGlExchangeRateRepository = mstGlExchangeRateRepository;
            _uomRepo = uomRepo;
            _mstContractTemplateRepo = mstContractTemplateRepo;
            _poLookupCodesRepo = poLookupCodesRepo;
            _mstCatalogRepo = mstCatalogRepo;
        }
        public async Task<List<CommonAllInventoryGroup>> GetAllInventoryGroups()
        {
            return await _invenGRepo.GetAll().AsNoTracking().Select(e => new CommonAllInventoryGroup
            {
                Id = e.Id,
                ProductGroupCode = e.ProductGroupCode,
                ProductGroupName = e.ProductGroupName
            }).ToListAsync();
        }

        public async Task<List<CommonAllCurrency>> GetAllCurrencies()
        {
            return await _curRepo.GetAll().AsNoTracking().Select(e => new CommonAllCurrency
            {
                Id = e.Id,
                CurrencyCode = e.CurrencyCode
            }).OrderByDescending(p => p.Id).ToListAsync();
        }

        public async Task<List<CommonAllSupplier>> GetAllSuppliers()
        {
            return await _supplierRepo.GetAll().AsNoTracking().Select(e => new CommonAllSupplier
            {
                Id = e.Id,
                SupplierName = e.SupplierName,
                SupplierNumber = e.SupplierNumber,
                VatRegistrationNum = e.VatRegistrationNum,
                TaxPayerId = e.TaxPayerId,
                RegistryId = e.RegistryId,
                StartDateActive = e.StartDateActive,
                EndDateActive = e.EndDateActive
            }).ToListAsync();
        }

        public async Task<List<CommonAllSupplierSite>> GetAllSupplierSitesBySupplerId(long supplierId)
        {
            var supplierSites = from site in _supSitesRepo.GetAll().AsNoTracking()
                                where (supplierId == 0 || site.SupplierId == supplierId)
                                && site.InactiveDate == null
                                select new CommonAllSupplierSite()
                                {
                                    Id = site.Id,
                                    Country = site.Country,
                                    InvoiceCurrencyCode = site.InvoiceCurrencyCode,
                                    PaymentCurrencyCode = site.PaymentCurrencyCode,
                                    SupplierId = site.SupplierId,
                                    VendorSiteCode = site.VendorSiteCode,
                                    PurchasingSiteFlag = site.PurchasingSiteFlag,
                                    AddressLine1 = site.AddressLine1,
                                    AddressLine2 = site.AddressLine2,
                                    IsDefault = site.IsSiteDefault
                                };
            return await supplierSites.ToListAsync();
        }

        public async Task<List<CommonAllSupplierSite>> GetAllSupplierSites()
        {
            var supplierSites = from site in _supSitesRepo.GetAll().AsNoTracking()
                                select new CommonAllSupplierSite()
                                {
                                    Id = site.Id,
                                    Country = site.Country,
                                    InvoiceCurrencyCode = site.InvoiceCurrencyCode,
                                    PaymentCurrencyCode = site.PaymentCurrencyCode,
                                    SupplierId = site.SupplierId,
                                    VendorSiteCode = site.VendorSiteCode,
                                    PurchasingSiteFlag = site.PurchasingSiteFlag,
                                    AddressLine1 = site.AddressLine1,
                                    AddressLine2 = site.AddressLine2
                                };
            return await supplierSites.ToListAsync();
        }

        public async Task<List<CommonAllLineType>> GetAllLineTypes()
        {
            return await _lineTypeRepo.GetAll().AsNoTracking().Select(e => new CommonAllLineType
            {
                Id = e.Id,
                LineTypeCode = e.LineTypeCode,
                LineTypeName = e.LineTypeName
            }).ToListAsync();
        }

        public async Task<List<GetMstLocationsDto>> getAllLocations()
        {
            var listLocations = from locations in _mstLocationsRepository.GetAll().AsNoTracking()
                                select new GetMstLocationsDto()
                                {
                                    Id = locations.Id,
                                    Language = locations.Language,
                                    LocationCode = locations.LocationCode,
                                    SourceLanguage = locations.SourceLanguage,
                                    Description = locations.Description
                                };
            return listLocations.ToList();
        }

        public Task<List<CommonAllSupplierContacts>> GetAllSupplierContact(long supplierSiteId)
        {
            var listContacts = from contact in _mstSupplierContactsRepository.GetAll().AsNoTracking()
                               where (supplierSiteId == 0 || contact.SupplierSiteId == supplierSiteId)
                               select new CommonAllSupplierContacts()
                               {
                                   Id = contact.Id,
                                   SupplierSiteId = contact.SupplierSiteId,
                                   FirstName = contact.FirstName,
                                   LastName = contact.LastName,
                                   MidName = contact.MidName,
                                   UserName = contact.UserName
                               };
            return listContacts.ToListAsync();
        }

        public Task<List<GetRequesterDto>> getAllUsersInfo()
        {
            var listUsers = from users in _userRepository.GetAll().AsNoTracking()
                                join hrstr in _mstHrOrgStructure.GetAll().AsNoTracking()
                                on users.HrOrgStructureId equals hrstr.Id into k 
                                from hrstr in k.DefaultIfEmpty()
                                where users.IsActive == true
                                select new GetRequesterDto()
                                {
                                    Id = users.Id,
                                    UserName = users.UserName,
                                    Name = users.Name,
                                    Email = users.EmailAddress,
                                    DepartmentId = hrstr.Id,
                                    Department = hrstr.Name
                                };
                return listUsers.ToListAsync();
        }

        public async Task<List<CommonAllPurchasePurpose>> GetAllPurchasePurpose()
        {
            return await (_purposeRepo.GetAll().AsNoTracking().Select(p => new CommonAllPurchasePurpose
            {
                Id = p.Id,
                PurchasePurposeName = p.PurchasePurposeName,
                PurchasePurposeCode = p.PurchasePurposeCode,
                HaveBudgetCode = p.HaveBudgetCode,
                Status = p.Status,
            })).ToListAsync();
        }

        public async Task<List<CommonAllDepartment>> GetAllDepartments()
        {
            return await (_mstHrOrgStructure.GetAll().AsNoTracking().Select(d => new CommonAllDepartment
            {
                Id = d.Id,
                DepartmentName = d.Name
            })).ToListAsync();
        }

        public async Task<GetRequesterInfoForViewDto> GetRequesterInfo(long userId)
        {
            var result = await (from user in _userRepository.GetAll().Where(e => e.Id == userId).AsNoTracking()
                                join title in _titleRepo.GetAll().AsNoTracking() on user.TitlesId equals title.Id into titleJoined
                                from title in titleJoined.DefaultIfEmpty()
                                join org in _mstHrOrgStructure.GetAll().AsNoTracking() on (Guid)user.HrOrgStructureId equals org.Id into orgJoined
                                from org in orgJoined.DefaultIfEmpty()
                                select new GetRequesterInfoForViewDto
                                {
                                    Id = user.Id,
                                    UserName = user.Name,
                                    DepartmentId = org.Id,
                                    DepartmentName = org.Name,
                                    TitleId = title.Id,
                                    UserTitle = title.Name,
                                    Email = user.EmailAddress
                                }).FirstOrDefaultAsync();

            return result;
        }

        public async Task<PagedResultDto<CommonAllGlCodeCombination>> GetAllGlCodeCombinations(GetAllGlCombinationInput input)
        {
            var result = _glCodeRepo.GetAll().Where(e => string.IsNullOrWhiteSpace(input.BudgetCode) || e.ConcatenatedSegments.Contains(input.BudgetCode))
                .Select(e => new CommonAllGlCodeCombination { Id = e.Id, ConcatenatedSegments = e.ConcatenatedSegments });

            var totalCount = result.Count();

            var pagedAndSortedResult = result.PageBy(input);

            return new PagedResultDto<CommonAllGlCodeCombination>(
                totalCount,
                pagedAndSortedResult.ToList()
                );
        }

        public async Task<List<CommonAllProcessType>> GetAllProcessType()
        {
            return await _processTypeRepo.GetAll().Select(e => new CommonAllProcessType { Id = e.Id, ProcessTypeCode = e.ProcessTypeCode, ProcessTypeName = e.ProcessTypeName }).ToListAsync();
        }

        public async Task<List<GetMstOrganizationsDto>> getListOrgzationsByPartNo(string partNo)
        {
            var listOrg = from org in _mstMstOrganizationsRepository.GetAll().AsNoTracking()
                          join items in _mstMstInventoryItemsRepository.GetAll().AsNoTracking()
                          on org.Id equals items.OrganizationId
                          where partNo.Equals(items.PartNo + "." + items.Color)
                          && !"FAKE".Equals(items.Source)
                          select new GetMstOrganizationsDto()
                          {
                              Id = org.Id,
                              OrganizationCode = org.OrganizationCode,
                              Name = org.Name
                          };
            return listOrg.ToList();
        }

        public async Task<List<GetMstInventoryItemsDto>> getAllInventoryItemsByGroup(SearchInvItemsDto searchInvItemsDto)
        {
            string _sql = "EXEC sp_CommonGetPartList @PartNo, @ItemsGroupId, @SupplierId, @DocumentDate, @CurrencyCode";

            var listInvItems = await _spRepository.QueryAsync<GetMstInventoryItemsDto>(_sql, new
            {
                @PartNo = searchInvItemsDto.PartNo,
                @ItemsGroupId = searchInvItemsDto.InventoryGroupId,
                @SupplierId = searchInvItemsDto.SupplierId,
                @DocumentDate = searchInvItemsDto.DocumentDate,
                @CurrencyCode = searchInvItemsDto.CurrencyCode,
            });
            return listInvItems.ToList();
        }

        public async Task<SearchGlCodeOutputDto> getGlCombaination()
        {
            var glBudgetCode = from budget in _mstGlCodeCombinationRepository.GetAll().AsNoTracking()
                               where budget.AccountType.Equals("A")
                               && budget.EnabledFlag.Equals("Y")
                               && budget.ChartOfAccountsId == 50153
                               select new SearchGlCodeOutputDto()
                               {
                                   Id = budget.Id,
                                   ConcatenatedSegments = budget.ConcatenatedSegments
                               };
            SearchGlCodeOutputDto searchGlCodeOutputDto = glBudgetCode.OrderBy(p => p.Id).ToList()[0];
            return searchGlCodeOutputDto ?? new SearchGlCodeOutputDto();
        }

        public async Task<List<CommonGetReferencecs>> getListReference(long id, string type)
        {
            string _sql = "EXEC sp_CommonGetReference @HeaderId, @Type";

            var listReferences = await _spRepository.QueryAsync<CommonGetReferencecs>(_sql, new
            {
                @HeaderId = id,
                @Type = type
            });
            return listReferences.ToList();
        }

        public async Task<List<CommonLookupDto>> getLookupsBy(string lookupType)
        {
            var listLookup = from lookup in _poLookupCodesRepo.GetAll()
                             where lookup.LookupType.Equals(lookupType)
                             && lookup.IsActive == true
                             select new CommonLookupDto()
                             {
                                 Id = lookup.Id,
                                 LookupType = lookupType,
                                 DisplayedField = lookup.DisplayedField,
                                 Description = lookup.Description,
                                 LookupCode = lookup.LookupCode
                             };
            return listLookup.ToList();
        }

        public async Task<List<CommonPaymentTermsDto>> getAllPaymentTerms()
        {
            var listPaymentTerms = from paymentTerms in _mstPaymentTerms.GetAll()
                                   select new CommonPaymentTermsDto()
                                   {
                                       Id = paymentTerms.Id,
                                       EnableFlag = paymentTerms.EnableFlag,
                                       Description = paymentTerms.Description,
                                       Name = paymentTerms.Name,
                                       Type = paymentTerms.Type
                                   };
            return listPaymentTerms.ToList();
        }

        public async Task<GetRequesterDto> geUserById(long id)
        {
            var listRequester = from requester in _userRepository.GetAll().AsNoTracking()
                                join title in _titleRepo.GetAll().AsNoTracking()
                                on requester.TitlesId equals title.Id
                                where requester.Id == id
                                select new GetRequesterDto()
                                {
                                    Id = requester.Id,
                                    UserName = requester.UserName,
                                    Name = requester.Name,
                                    Email = requester.EmailAddress,
                                    Title = title.Name,
                                    Tel = requester.PhoneNumber
                                };
            return listRequester.FirstOrDefault();
        }

        public async Task<List<CommonGetGlExchangeRateDto>> getGlExchangeRate(InputGetGlExchangRateDto inputGetGlExchangRateDto)
        {
            string _sql = "EXEC sp_CommonGetGlExchangeRate @FromCurrency, @ToCurrency, @ConversionDate";

            var listGlExchangeRate = await _spRepository.QueryAsync<CommonGetGlExchangeRateDto>(_sql, new
            {
                @FromCurrency = inputGetGlExchangRateDto.FromCurrency,
                @ToCurrency = inputGetGlExchangRateDto.ToCurrency,
                @ConversionDate = inputGetGlExchangRateDto.ConversionDate
            });
            return listGlExchangeRate.ToList();
        }

        public async Task<CommonDefaultParameterDto> GetDefaultParameter()
        {
            CommonDefaultParameterDto result = new CommonDefaultParameterDto();

            var curencyDefault = await _curRepo.FirstOrDefaultAsync(e => e.CurrencyCode == "VND");
            var uomDefault = await _uomRepo.FirstOrDefaultAsync(e => e.UOMCode == "UNT");

            result.CurencyId = curencyDefault.Id;
            result.CurencyCode = curencyDefault.CurrencyCode;
            result.UomId = uomDefault.Id;
            result.Uom = uomDefault.UnitOfMeasure;

            return result;
        }

        public async Task<List<CommonAllDocument>> getDocumentByProcessType(string processTypeCode)
        {
            string _sql = "EXEC sp_CommonGetDocument @ProcessTypeCode";

            var listGlExchangeRate = await _spRepository.QueryAsync<CommonAllDocument>(_sql, new
            {
                @ProcessTypeCode = processTypeCode
            });
            return listGlExchangeRate.ToList();
        }

        public async Task<List<CommonAllTemplate>> getTemplateContractByInvGroup(long invGroupId)
        {
            var templateContracts = from contract in _mstContractTemplateRepo.GetAll().AsNoTracking()
                                    where contract.IsActive == "Active"
                                    && contract.InventoryGroupId == invGroupId
                                    select new CommonAllTemplate()
                                    {
                                        Id = contract.Id,
                                        TemplateCode = contract.TemplateCode,
                                        TemplateName = contract.TemplateName,
                                        InventoryGroupId = contract.InventoryGroupId,
                                    };
            return templateContracts.ToList();
        }

        public async Task<List<CommonAllOrganization>> GetAllOrganization()
        {
            string sqlCommand = "EXEC sp_CommonAllOrganization";
            IEnumerable<CommonAllOrganization> organizations = await _spRepository.QueryAsync<CommonAllOrganization>(sqlCommand);
            return organizations.ToList();
        }

        public async Task<List<CommonGetAllCatalogDto>> getAllCatalog()
        {
            var listCataLog = from catalog in _mstCatalogRepo.GetAll().AsNoTracking()
                              select new CommonGetAllCatalogDto()
                              {
                                  Id = catalog.Id,
                                  CatalogName = catalog.CatalogName,
                                  CatalogCode = catalog.CatalogCode
                              };
            return listCataLog.ToList();
        }
    }
}
