using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Master.Catalog;
using tmss.Master.Catalog.Dto;
using tmss.Master.ExchangeRate;
using tmss.Master.ExchangeRate.Dto;

namespace tmss.Master
{
    public class MstCatalogAppService : tmssAppServiceBase, IMstCatalogAppService
    {
        private readonly IRepository<MstGlExchangeRate, long> _mstGlExchangeRateRepository;
        private readonly IRepository<MstCatalog, long> _catalogRepo;
        private readonly IRepository<MstInventoryGroup, long> _inventoryGroupRepo;
        private readonly IRepository<MstCurrency, long> _mstCurrencyRepository;
        public MstCatalogAppService(
            IRepository<MstGlExchangeRate, long> mstGlExchangeRateRepository,
            IRepository<MstCatalog, long> catalogRepo,
            IRepository<MstInventoryGroup, long> inventoryGroupRepo,
            IRepository<MstCurrency, long> mstCurrencyRepository)
        {
            _mstGlExchangeRateRepository = mstGlExchangeRateRepository;
            _catalogRepo = catalogRepo;
            _inventoryGroupRepo = inventoryGroupRepo;
            _mstCurrencyRepository = mstCurrencyRepository;
        }

        [AbpAuthorize(AppPermissions.MasterCatalog_Search)]
        public async Task<PagedResultDto<SearchCatalogOutputDto>> GetAllData(GetCatalogSearchInput input)
        {
            //string CurrencyCode = "";
            //if(searchInputDto.CurrencyId > 0)
            //{
            //    MstCurrency mstCurrency = _mstCurrencyRepository.GetAll().Where(p => p.Id == searchInputDto.CurrencyId).FirstOrDefault();
            //    CurrencyCode = mstCurrency.CurrencyCode;
            //}
           
            var result = from c in _catalogRepo.GetAll().AsNoTracking()
                                .Where(p=> string.IsNullOrWhiteSpace(input.FilterText) || p.CatalogCode.Contains(input.FilterText) || p.CatalogName.Contains(input.FilterText))
                               select new SearchCatalogOutputDto()
                               {
                                    Id = c.Id,
                                    CatalogName = c.CatalogName,
                                   CatalogCode = c.CatalogCode,
                                    IsActive = c.IsActive,
                                    InventoryGroupId = c.InventoryGroupId,
                               };

            var pagedAndFilteredInfo = result.PageBy(input);
            int totalCount = await result.CountAsync();
            return new PagedResultDto<SearchCatalogOutputDto>(
                       result.Count(),
                       pagedAndFilteredInfo.ToList()
                      );
        }

        [AbpAuthorize(AppPermissions.MasterCatalog_Add)]
        public async Task CreateOrEdit(SearchCatalogOutputDto dto)
        {
            if (dto.Id == 0 || dto.Id == null)  // create New
            {
                var newCatalog = new MstCatalog();
                newCatalog.CatalogCode = dto.CatalogCode;
                newCatalog.CatalogName = dto.CatalogName;
                newCatalog.IsActive = dto.IsActive;
                newCatalog.InventoryGroupId = dto.InventoryGroupId;

                await _catalogRepo.InsertAsync(newCatalog);
            }
            else // update 
            {
                var catalog = await _catalogRepo.FirstOrDefaultAsync(e => e.Id == dto.Id);
                if (catalog != null)
                {
                    catalog.CatalogCode = dto.CatalogCode;
                    catalog.CatalogName = dto.CatalogName;
                    catalog.IsActive = dto.IsActive;
                    catalog.InventoryGroupId = dto.InventoryGroupId;

                }

                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }

        [AbpAuthorize(AppPermissions.MasterCatalog_Delete)]
        public async Task Delete(long id)
        {
            await _catalogRepo.DeleteAsync(id);
        }

    }
}
