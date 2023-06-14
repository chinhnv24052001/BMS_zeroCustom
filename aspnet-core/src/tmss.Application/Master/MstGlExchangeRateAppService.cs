using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using GemBox.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Common;
using tmss.Master.ExchangeRate;
using tmss.Master.ExchangeRate.Dto;

namespace tmss.Master
{
    public class MstGlExchangeRateAppService : tmssAppServiceBase, IMstGlExchangeRateAppService
    {
        private readonly IRepository<MstGlExchangeRate, long> _mstGlExchangeRateRepository;
        private readonly IRepository<MstCurrency, long> _mstCurrencyRepository;
        public MstGlExchangeRateAppService(
            IRepository<MstGlExchangeRate, long> mstGlExchangeRateRepository,
            IRepository<MstCurrency, long> mstCurrencyRepository)
        {
            _mstGlExchangeRateRepository = mstGlExchangeRateRepository;
            _mstCurrencyRepository = mstCurrencyRepository;
        }

        [AbpAuthorize(AppPermissions.MstExchangeRateData_Search)]
        public async Task<PagedResultDto<SearchOutputDto>> GetAllData(GetSearchInput searchInputDto)
        {
            string CurrencyCode = "";
            string ToCurrencyCode = "";
            if (searchInputDto.CurrencyId > 0)
            {
                MstCurrency mstCurrency = _mstCurrencyRepository.GetAll().Where(p => p.Id == searchInputDto.CurrencyId).FirstOrDefault();
                CurrencyCode = mstCurrency.CurrencyCode;
            }
            if (searchInputDto.ToCurrencyId > 0)
            {
                MstCurrency mstCurrency = _mstCurrencyRepository.GetAll().Where(p => p.Id == searchInputDto.ToCurrencyId).FirstOrDefault();
                ToCurrencyCode = mstCurrency.CurrencyCode;
            }

            var listRate = from exchange in _mstGlExchangeRateRepository.GetAll().AsNoTracking()
                                .Where(p=>p.FromCurrency == CurrencyCode || CurrencyCode=="")
                                .Where(p=>p.ToCurrency == ToCurrencyCode || ToCurrencyCode == "")
                                .Where(p=> searchInputDto.StartDate == null || searchInputDto.StartDate <=p.ConversionDate)
                                .Where(p => searchInputDto.EndDate == null || searchInputDto.EndDate >= p.ConversionDate)
                           select new SearchOutputDto()
                               {
                                    Id = exchange.Id,
                                    FromCurrency = exchange.FromCurrency,
                                    ToCurrency = exchange.ToCurrency,
                                    ConversionDate = exchange.ConversionDate,
                                    ConversionRate = exchange.ConversionRate
                               };

            var pagedAndFilteredInfo = listRate.PageBy(searchInputDto);
            int totalCount = await listRate.CountAsync();
            return new PagedResultDto<SearchOutputDto>(
                       listRate.Count(),
                       pagedAndFilteredInfo.ToList()
                      );
        }

        [AbpAuthorize(AppPermissions.MstExchangeRateData_Add, AppPermissions.MstExchangeRateData_Edit)]
        public async Task CreateOrEdit(SearchOutputDto dto)
        {
            if (dto.Id == 0 || dto.Id == null)  // create New
            {
                var newCurrency = new MstGlExchangeRate();
                newCurrency.FromCurrency = dto.FromCurrency;
                newCurrency.ToCurrency = dto.ToCurrency;
                newCurrency.ConversionRate = dto.ConversionRate;
                newCurrency.ConversionDate = dto.ConversionDate;
                newCurrency.ConversionType = "Corporate";
                newCurrency.Status_Code = "C";

                await _mstGlExchangeRateRepository.InsertAsync(newCurrency);
            }
            else // update 
            {
                var currencyData = await _mstGlExchangeRateRepository.FirstOrDefaultAsync(e => e.Id == dto.Id);
                if (currencyData != null)
                {
                    currencyData.FromCurrency = dto.FromCurrency;
                    currencyData.ToCurrency = dto.ToCurrency;
                    currencyData.ConversionRate = dto.ConversionRate;
                    currencyData.ConversionDate = dto.ConversionDate;

                }

                await CurrentUnitOfWork.SaveChangesAsync();
            }
        }

        [AbpAuthorize(AppPermissions.MstExchangeRateData_Delete)]
        public async Task Delete(long id)
        {
            await _mstGlExchangeRateRepository.DeleteAsync(id);
        }


        [AbpAuthorize(AppPermissions.MstExchangeRateData_Export)]
        public async Task<byte[]> MstGlExchangeRateExportExcel(InputMstGlExchangeRateExportDto input)
        {

            string CurrencyCode = "";
            string ToCurrencyCode = "";
            if (input.CurrencyId > 0)
            {
                MstCurrency mstCurrency = _mstCurrencyRepository.GetAll().Where(p => p.Id == input.CurrencyId).FirstOrDefault();
                CurrencyCode = mstCurrency.CurrencyCode;
            }
            if (input.ToCurrencyId > 0)
            {
                MstCurrency mstCurrency = _mstCurrencyRepository.GetAll().Where(p => p.Id == input.ToCurrencyId).FirstOrDefault();
                ToCurrencyCode = mstCurrency.CurrencyCode;
            }

            var listRate = from exchange in _mstGlExchangeRateRepository.GetAll().AsNoTracking()
                                .Where(p => p.FromCurrency == CurrencyCode || CurrencyCode == "")
                                .Where(p => p.ToCurrency == ToCurrencyCode || ToCurrencyCode == "")
                                .Where(p => input.StartDate == null || input.StartDate <= p.ConversionDate)
                                .Where(p => input.EndDate == null || input.EndDate >= p.ConversionDate)
                           select new SearchOutputDto()
                           {
                               Id = exchange.Id,
                               FromCurrency = exchange.FromCurrency,
                               ToCurrency = exchange.ToCurrency,
                               ConversionDate = exchange.ConversionDate,
                               ConversionRate = exchange.ConversionRate
                           };
            var result = listRate.ToList();
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            var v_list_export_excel = result.ToList();
            List<string> list = new List<string>();
            list.Add("FromCurrency");
            list.Add("ToCurrency");
            list.Add("ConversionDate");
            list.Add("ConversionRate");

            List<string> listHeader = new List<string>();
            listHeader.Add("From Currency");
            listHeader.Add("To Currency");
            listHeader.Add("Conversion Date");
            listHeader.Add("Conversion Rate");

            string[] properties = list.ToArray();
            string[] p_header = listHeader.ToArray();
            Commons.FillExcel(v_list_export_excel, v_worksheet, 1, 0, properties, p_header);
            Commons.ExcelFormatDate(v_worksheet, 2);


            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            xlWorkBook.Save(tempFile);
            var tempFile2 = Commons.SetAutoFit(tempFile, p_header.Length);
            byte[] fileByte = await File.ReadAllBytesAsync(tempFile2);
            File.Delete(tempFile);
            File.Delete(tempFile2);
            return fileByte;
        }
    }
}
