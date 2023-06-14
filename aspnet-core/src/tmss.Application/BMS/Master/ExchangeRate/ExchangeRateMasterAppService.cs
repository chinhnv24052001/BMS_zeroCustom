using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Enum;
using tmss.BMS.Master.ExchangeRateMaster;
using tmss.BMS.Master.ExchangeRateMaster.Dto;
using tmss.BMS.Master.Period;
using tmss.BMS.Master.Segment1;
using tmss.BMS.Master.Segment1.Dto;
using tmss.Core.BMS.Master.Period;
using tmss.Master;

namespace tmss.BMS.Master.ExchangeRate
{
    public class ExchangeRateMasterAppService : tmssAppServiceBase, IExchangeRateMasterAppService
    {
        private readonly IRepository<BmsMstExchangeRate, long> _bmsMstExchangeRateRepository;
        private readonly IRepository<BmsMstPeriod, long> _mstBmsPeriodRepository;
        private readonly IRepository<BmsMstPeriodVersion, long> _bmsMstPeriodVersionRepository;
        private readonly IRepository<MstCurrency, long> _mstCurrencyRepository;
        private readonly IRepository<BmsMstVersion, long> _bmsMstVersionRepository;
        public ExchangeRateMasterAppService(
             IRepository<BmsMstExchangeRate, long> bmsMstExchangeRateRepository,
             IRepository<BmsMstPeriod, long> mstBmsPeriodRepository,
             IRepository<BmsMstPeriodVersion, long> bmsMstPeriodVersionRepository,
             IRepository<MstCurrency, long> mstCurrencyRepository,
             IRepository<BmsMstVersion, long> bmsMstVersionRepository
            )
        {
            _bmsMstExchangeRateRepository = bmsMstExchangeRateRepository;
            _mstBmsPeriodRepository = mstBmsPeriodRepository;
            _bmsMstPeriodVersionRepository = bmsMstPeriodVersionRepository;
            _mstCurrencyRepository = mstCurrencyRepository;
            _bmsMstVersionRepository = bmsMstVersionRepository;
        }

        public async Task Delete(long id)
        {
            BmsMstExchangeRate bmsMstExchangeRate = _bmsMstExchangeRateRepository.Load(id);
            if (bmsMstExchangeRate != null)
            {
                await _bmsMstExchangeRateRepository.DeleteAsync(id);
            }
        }

        public async Task<PagedResultDto<MstExchangeRateDto>> getAllExchangeRate(SearchExchangeRateDto searchExchangeRateDto)
        {
            var exchangeEnum = from exchange in _bmsMstExchangeRateRepository.GetAll().AsNoTracking()
                               join version in _bmsMstPeriodVersionRepository.GetAll().AsNoTracking()
                               on exchange.PeriodVersionId equals version.Id

                               join mstVersion in _bmsMstVersionRepository.GetAll().AsNoTracking()
                               on version.VersionId equals mstVersion.Id

                               join period in _mstBmsPeriodRepository.GetAll().AsNoTracking()
                               on version.PeriodId equals period.Id

                               join currency in _mstCurrencyRepository.GetAll().AsNoTracking()
                               on exchange.CurrencyId equals currency.Id

                               where ((searchExchangeRateDto.PeriodId == 0 || exchange.PeriodId == searchExchangeRateDto.PeriodId)
                               && (searchExchangeRateDto.CurrencyId == 0 || exchange.CurrencyId == searchExchangeRateDto.CurrencyId))
                               select new MstExchangeRateDto
                               {
                                   Id = exchange.Id,
                                   PeriodVersionName = mstVersion.VersionName,
                                   PeriodName = period.PeriodName,
                                   CurrencyName = currency.CurrencyCode,
                                   ExchangeRate = exchange.ExchangeRate,
                                   Description = exchange.Description
                               };
        var result = exchangeEnum.Skip(searchExchangeRateDto.SkipCount).Take(searchExchangeRateDto.MaxResultCount);
            return new PagedResultDto<MstExchangeRateDto>(
                       exchangeEnum.Count(),
                       result.ToList()
                      );
        }

        public async Task<InputExchangeRateDto> LoadById(long id)
        {
            var x = BmsMstColumn.Apr;
            var exchangeEnum = from exchange in _bmsMstExchangeRateRepository.GetAll().AsNoTracking()
                               where exchange.Id == id
                               select new InputExchangeRateDto
                               {
                                   Id = exchange.Id,
                                   PeriodVersionId = exchange.PeriodVersionId,
                                   PeriodId = exchange.PeriodId,
                                   CurrencyId = exchange.CurrencyId,
                                   ExchangeRate= exchange.ExchangeRate,
                                   Description = exchange.Description
                               };
            return exchangeEnum.FirstOrDefault();
        }

        public async Task Save(InputExchangeRateDto inputExchangeRateDto)
        {
            if (inputExchangeRateDto.Id == 0)
            {
                await Create(inputExchangeRateDto);
            }
            else
            {
                await Update(inputExchangeRateDto);
            }
        }

        private async Task Create(InputExchangeRateDto inputExchangeRateDto)
        {
            BmsMstExchangeRate bmsMstExchangeRate = new BmsMstExchangeRate();
            bmsMstExchangeRate.PeriodVersionId = inputExchangeRateDto.PeriodVersionId;
            bmsMstExchangeRate.PeriodId = inputExchangeRateDto.PeriodId;
            bmsMstExchangeRate.CurrencyId = inputExchangeRateDto.CurrencyId;
            bmsMstExchangeRate.ExchangeRate = inputExchangeRateDto.ExchangeRate;
            bmsMstExchangeRate.Description = inputExchangeRateDto.Description;
            await _bmsMstExchangeRateRepository.InsertAsync(bmsMstExchangeRate);
        }

        private async Task Update(InputExchangeRateDto inputExchangeRateDto)
        {
            BmsMstExchangeRate bmsMstExchangeRate = await _bmsMstExchangeRateRepository.FirstOrDefaultAsync(p => p.Id == inputExchangeRateDto.Id);
            bmsMstExchangeRate.PeriodVersionId = inputExchangeRateDto.PeriodVersionId;
            bmsMstExchangeRate.PeriodId = inputExchangeRateDto.PeriodId;
            bmsMstExchangeRate.CurrencyId = inputExchangeRateDto.CurrencyId;
            bmsMstExchangeRate.ExchangeRate = inputExchangeRateDto.ExchangeRate;
            bmsMstExchangeRate.Description = inputExchangeRateDto.Description;
            await _bmsMstExchangeRateRepository.UpdateAsync(bmsMstExchangeRate);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task SyncBMSEnum (BmsMstColumn id)
        {
            //var x = BmsMstColumn.May;
        }
    }
}
