using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Abp.UI;
using AutoMapper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.PurchasePurpose.Dto;
using tmss.Master.PurchasePurpose;
using tmss.Master;
using tmss;
using tmss.Master.Currency;
using tmss.Master.Currency.Dto;
using Microsoft.EntityFrameworkCore;
using Abp.Runtime.Session;
using tmss.Master.UnitOfMeasure.Dto;
using tmss.Master.InventoryGroup.Dto;
using Abp.Authorization;
using tmss.Authorization;

namespace tmss.Master
{
    public class MstCurrencyAppService : tmssAppServiceBase, IMstCurrency
    {
        private readonly IRepository<MstCurrency, long> _mstCurrencyRepository;
        public MstCurrencyAppService(IRepository<MstCurrency, long> mstCurrencyRepository)
        {
            _mstCurrencyRepository = mstCurrencyRepository;
        }

        [AbpAuthorize(AppPermissions.CurrencyType_Delete)]
        public async Task Delete(long id)
        {
            var curency = await _mstCurrencyRepository.FirstOrDefaultAsync(p => p.Id == id);
            if (curency != null)
            {
                await _mstCurrencyRepository.DeleteAsync(id);
            }
            else
            {
                throw new UserFriendlyException(400, AppConsts.ValRecordsDelete);
            }
        }

        [AbpAllowAnonymous]
        [AbpAuthorize(AppPermissions.CurrencyType_Search, AppPermissions.MstExchangeRateData_Search)]
        public async Task<List<LoadAllOutputDto>> LoadAll(bool hasAll)
        {
            var listcurrency = from curency in _mstCurrencyRepository.GetAll().AsNoTracking()
                              
                               select new LoadAllOutputDto()
                               {
                                   Id = curency.Id,
                                   CurrencyCode = curency.CurrencyCode 
                               };
            List< LoadAllOutputDto> loadAllOutputDtos =  listcurrency.ToList();
            if (hasAll)
            {
                LoadAllOutputDto loadAllOutputDto = new LoadAllOutputDto();
                loadAllOutputDto.Id = 0;
                loadAllOutputDto.CurrencyCode = "";
                loadAllOutputDtos.Insert(0, loadAllOutputDto);
            }
            return loadAllOutputDtos;
        }

        [AbpAuthorize(AppPermissions.CurrencyType_Search)]
        public async Task<PagedResultDto<MstCurrencySelectDto>> LoadAllCurrency(InputSearchMstCurrency inputSearchMstCurrency)
        {
            var listCurrency = from currency in _mstCurrencyRepository.GetAll().AsNoTracking()
                               where ((string.IsNullOrWhiteSpace(inputSearchMstCurrency.CurrencyCode) || currency.CurrencyCode.Contains(inputSearchMstCurrency.CurrencyCode))
                               && (string.IsNullOrWhiteSpace(inputSearchMstCurrency.Name) || currency.Name.Contains(inputSearchMstCurrency.Name)))
                               select new MstCurrencySelectDto()
                               {
                                   Id = currency.Id,
                                   CurrencyCode = currency.CurrencyCode,
                                   Name = currency.Name,
                                   DescriptionEnglish = currency.DescriptionEnglish,
                                   DescriptionVetNamese = currency.DescriptionVetNamese,
                                   Status = currency.Status
                               };
            var result = listCurrency.Skip(inputSearchMstCurrency.SkipCount).Take(inputSearchMstCurrency.MaxResultCount);
            return new PagedResultDto<MstCurrencySelectDto>(
                       listCurrency.Count(),
                       result.ToList()
                      );
        }

        [AbpAuthorize(AppPermissions.CurrencyType_Edit)]
        public async Task<MstCurrencyDto> LoadById(long id)
        {
            var listcurrency = from curency in _mstCurrencyRepository.GetAll().AsNoTracking()
                               where curency.Id == id
                               select new MstCurrencyDto()
                               {
                                   Id = curency.Id,
                                   CurrencyCode = curency.CurrencyCode,
                                   Name = curency.Name,
                                   DescriptionEnglish = curency.DescriptionEnglish,
                                   DescriptionVetNamese = curency.DescriptionVetNamese,
                                   Status = curency.Status,
                               };
            return listcurrency.FirstOrDefault();
        }

        public async Task<ValInventoryGroupDto> Save(MstCurrencyDto currency)
        {
            ValInventoryGroupDto result = new ValInventoryGroupDto();

            if (currency.Id == 0)
            {
                //Check duplicate for create
                var currency1 = await _mstCurrencyRepository.FirstOrDefaultAsync(e => e.Name.Equals(currency.Name));
                result.Name = currency1 != null ? AppConsts.DUPLICATE_NAME : null;

                var mstInventory2 = await _mstCurrencyRepository.FirstOrDefaultAsync(e => e.CurrencyCode.Equals(currency.CurrencyCode));
                result.Code = mstInventory2 != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Name != null || result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Create(currency);
                }
            }
            else
            {
                //Check duplicate for edit
                var currency1 = await _mstCurrencyRepository.FirstOrDefaultAsync(e => e.Name.Equals(currency.Name) && e.Id != currency.Id);
                result.Name = currency1 != null ? AppConsts.DUPLICATE_NAME : null;

                var mstInventory2 = await _mstCurrencyRepository.FirstOrDefaultAsync(e => e.CurrencyCode.Equals(currency.CurrencyCode) && e.Id != currency.Id);
                result.Code = mstInventory2 != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Name != null || result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Update(currency);
                }
            }

            return result;
        }

        [AbpAuthorize(AppPermissions.CurrencyType_Add)]
        private async Task Create(MstCurrencyDto currency)
        {
            MstCurrency mstCurrency = new MstCurrency();
            mstCurrency.CurrencyCode = currency.CurrencyCode;
            mstCurrency.Name = currency.Name;
            mstCurrency.DescriptionEnglish = currency.DescriptionEnglish;
            mstCurrency.DescriptionVetNamese = currency.DescriptionVetNamese;
            mstCurrency.Status = currency.Status;

            mstCurrency.CreationTime = DateTime.Now;
            mstCurrency.CreatorUserId = AbpSession.GetUserId();
            await _mstCurrencyRepository.InsertAsync(mstCurrency);
        }

        [AbpAuthorize(AppPermissions.CurrencyType_Edit)]
        private async Task Update(MstCurrencyDto currency)
        {
            MstCurrency mstCurrency = await _mstCurrencyRepository.FirstOrDefaultAsync(p => p.Id == currency.Id);
            mstCurrency.CurrencyCode = currency.CurrencyCode;
            mstCurrency.Name = currency.Name;
            mstCurrency.DescriptionEnglish = currency.DescriptionEnglish;
            mstCurrency.DescriptionVetNamese = currency.DescriptionVetNamese;
            mstCurrency.Status = currency.Status;

            mstCurrency.LastModificationTime = DateTime.Now;
            mstCurrency.LastModifierUserId = AbpSession.GetUserId();
            await _mstCurrencyRepository.UpdateAsync(mstCurrency);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task<List<MstCurrencySelectDto>> LoadAllCurrencyNoPage()
        {
            var currencyEnum = from currency in _mstCurrencyRepository.GetAll().AsNoTracking()
                               select new MstCurrencySelectDto()
                               {
                                   Id = currency.Id,
                                   CurrencyCode = currency.CurrencyCode,
                                   Name = currency.Name,
                                   DescriptionEnglish = currency.DescriptionEnglish,
                                   DescriptionVetNamese = currency.DescriptionVetNamese,
                                   Status = currency.Status
                               };
            return currencyEnum.ToList();
        }
    }
}

