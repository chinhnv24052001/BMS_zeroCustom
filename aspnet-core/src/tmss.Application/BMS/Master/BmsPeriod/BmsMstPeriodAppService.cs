using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using DevExpress.XtraRichEdit.Model;
using GemBox.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.Auditing.Dto;
using tmss.Auditing.Exporting;
using tmss.BMS.Master.BmsPeriod;
using tmss.BMS.Master.BmsPeriod.Dto;
using tmss.BMS.Master.Segment5;
using tmss.BMS.Master.Segment5.Dto;
using tmss.Common;
using tmss.Core.BMS.Master.Period;
using tmss.Dto;
using tmss.Master.InventoryItems.Dto;
using tmss.Master.Period.Dto;

namespace tmss.BMS.Master.BmsMstPeriodApp
{
    public class BmsMstPeriodAppService : tmssAppServiceBase, IBmsMstPeriodAppService
    {
        private readonly IRepository<BmsMstPeriod, long> _mstBmsPeriodRepository;
        private readonly IAuditLogListExcelExporter _auditLogListExcelExporter;
        public BmsMstPeriodAppService(
            IRepository<BmsMstPeriod, long> mstBmsPeriodRepository,
             IAuditLogListExcelExporter auditLogListExcelExporter
            )
        {
            _mstBmsPeriodRepository = mstBmsPeriodRepository;
            _auditLogListExcelExporter = auditLogListExcelExporter;
        }

        public async Task Delete(long id)
        {
            BmsMstPeriod period = _mstBmsPeriodRepository.Load(id);
            if (period != null)
            {
                await _mstBmsPeriodRepository.DeleteAsync(id);
            }
        }

        public async Task<PagedResultDto<BmsMstPeriodDto>> getAllPeriod(SearchPeriodDto searchPeriodDto)
        {
            var periodEnum = from pro in _mstBmsPeriodRepository.GetAll().AsNoTracking()
                               where ((searchPeriodDto.PeriodYear == 0 || searchPeriodDto.PeriodYear == null || pro.PeriodYear == searchPeriodDto.PeriodYear)
                               && (string.IsNullOrWhiteSpace(searchPeriodDto.PeriodName) || pro.PeriodName.Contains(searchPeriodDto.PeriodName)))
                               select new BmsMstPeriodDto
                               {
                                   Id = pro.Id,
                                   PeriodName = pro.PeriodName,
                                   PeriodYear = pro.PeriodYear,
                                   FromDate = pro.FromDate,
                                   Todate = pro.Todate,
                                   IsActive = pro.IsActive,
                                   Description = pro.Description,
                               };
            var result = periodEnum.Skip(searchPeriodDto.SkipCount).Take(searchPeriodDto.MaxResultCount);
            return new PagedResultDto<BmsMstPeriodDto>(
                       periodEnum.Count(),
                       result.ToList()
                      );
        }

       public async Task<InputBmsMstPeriodDto> LoadById(long id)
        {
            var periodEnum = from pro in _mstBmsPeriodRepository.GetAll().AsNoTracking()
                             where pro.Id == id
                               select new InputBmsMstPeriodDto
                               {
                                   Id = pro.Id,
                                   PeriodName = pro.PeriodName,
                                   PeriodYear = pro.PeriodYear,
                                   FromDate = pro.FromDate,
                                   Todate = pro.Todate,
                                   IsActive = pro.IsActive,
                                   Description = pro.Description,
                               };
            return periodEnum.FirstOrDefault();
        }

        public async Task<ValPeriodSaveDto> Save(InputBmsMstPeriodDto inputBmsMstPeriodDto)
        {
            ValPeriodSaveDto result = new ValPeriodSaveDto();
            if (inputBmsMstPeriodDto.Id == 0)
            {
                //Check duplicate for create
                var period = await _mstBmsPeriodRepository.FirstOrDefaultAsync(e => e.PeriodName.Equals(inputBmsMstPeriodDto.PeriodName));
                result.Name = period != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputBmsMstPeriodDto);
                }
            }
            else
            {
                //Check duplicate for edit
                var period = await _mstBmsPeriodRepository.FirstOrDefaultAsync(e => e.PeriodName.Equals(inputBmsMstPeriodDto.PeriodName) && e.Id != inputBmsMstPeriodDto.Id);
                result.Name = period != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputBmsMstPeriodDto);
                }
            }
            return result;
        }

        private async Task Create(InputBmsMstPeriodDto inputBmsMstPeriodDto)
        {
            BmsMstPeriod period = new BmsMstPeriod();
            period = ObjectMapper.Map<BmsMstPeriod>(inputBmsMstPeriodDto);
            await _mstBmsPeriodRepository.InsertAsync(period);
        }

        private async Task Update(InputBmsMstPeriodDto inputBmsMstPeriodDto)
        {
            BmsMstPeriod period = await _mstBmsPeriodRepository.FirstOrDefaultAsync(p => p.Id == inputBmsMstPeriodDto.Id);
            period.PeriodName = inputBmsMstPeriodDto.PeriodName;
            period.PeriodYear = inputBmsMstPeriodDto.PeriodYear;
            period.FromDate = inputBmsMstPeriodDto.FromDate;
            period.Todate = inputBmsMstPeriodDto.Todate;
            period.IsActive = inputBmsMstPeriodDto.IsActive;
            period.Description = inputBmsMstPeriodDto.Description;
            //period = ObjectMapper.Map<BmsMstPeriod>(inputBmsMstPeriodDto);
            await _mstBmsPeriodRepository.UpdateAsync(period);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task<List<BmsMstPeriodDto>> GetAllBmsPeriodNoPage(SearchPeriodDto searchPeriodDto)
        {
            var periodEnum = from pro in _mstBmsPeriodRepository.GetAll().AsNoTracking()
                             where ((searchPeriodDto.PeriodYear == 0 || pro.PeriodYear == searchPeriodDto.PeriodYear)
                             && (string.IsNullOrWhiteSpace(searchPeriodDto.PeriodName) || pro.PeriodName.Contains(searchPeriodDto.PeriodName)))
                             select new BmsMstPeriodDto
                             {
                                 Id = pro.Id,
                                 PeriodName = pro.PeriodName,
                                 PeriodYear  = pro.PeriodYear,
                                 FromDate = pro.FromDate,
                                 Todate = pro.Todate,
                                 IsActive = pro.IsActive,
                                 Description = pro.Description,
                                 StatusString = pro.IsActive ? L("Active") : L("InActive"),
                             };
            return periodEnum.ToList();
        }

        public async Task<byte[]> GetPeriodToExcel(SearchPeriodDto searchPeriodDto)
        {
            var periodEnum = await GetAllBmsPeriodNoPage(searchPeriodDto);

            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            var v_list_export_excel = periodEnum.ToList();
            List<string> list = new List<string>();
            list.Add("PeriodName");
            list.Add("PeriodYear");
            list.Add("FromDate");
            list.Add("Todate");
            list.Add("Description");
            list.Add("StatusString");

            List<string> listHeader = new List<string>();
            listHeader.Add("Period name");
            listHeader.Add("Period year");
            listHeader.Add("From date");
            listHeader.Add("To date");
            listHeader.Add("Description");
            listHeader.Add("Status");

            string[] properties = list.ToArray();
            string[] p_header = listHeader.ToArray();
            Commons.FillExcel(v_list_export_excel, v_worksheet, 1, 0, properties, p_header);

            Commons.ExcelFormatDate(v_worksheet, 2);
            Commons.ExcelFormatDate(v_worksheet, 3);


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
