using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using GemBox.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.BMS.Master.BmsPeriod;
using tmss.BMS.Master.BmsPeriod.Dto;
using tmss.BMS.Master.Period;
using tmss.BMS.Master.Segment5;
using tmss.BMS.Master.Segment5.Dto;
using tmss.Common;
using tmss.Core.BMS.Master.Period;

namespace tmss.BMS.Master.BmsMstPeriodApp
{
    public class BmsPeriodVersionAppService : tmssAppServiceBase, IBmsPeriodVersionAppService
    {
        private readonly IRepository<BmsMstPeriod, long> _mstBmsPeriodRepository;
        private readonly IRepository<BmsMstPeriodVersion, long> _bmsMstPeriodVersionRepository;
        private readonly IRepository<BmsMstVersion, long> _bmsMstVersionRepository;
        public BmsPeriodVersionAppService(
            IRepository<BmsMstPeriod, long> mstBmsPeriodRepository,
            IRepository<BmsMstPeriodVersion, long> bmsMstPeriodVersionRepository,
            IRepository<BmsMstVersion, long> bmsMstVersionRepository
            )
        {
            _mstBmsPeriodRepository = mstBmsPeriodRepository;
            _bmsMstPeriodVersionRepository = bmsMstPeriodVersionRepository;
            _bmsMstVersionRepository = bmsMstVersionRepository;
        }

        public async Task Delete(long id)
        {
            BmsMstPeriodVersion periodVersion = _bmsMstPeriodVersionRepository.Load(id);
            if (periodVersion != null)
            {
                await _bmsMstPeriodVersionRepository.DeleteAsync(id);
            }
        }

        public async Task<PagedResultDto<BmsPeriodVersionDto>> getAllVersionByPeriodId(SearchPeriodVersionDto searchPeriodVersionDto)
        {
            var periodVersionEnum = from version in _bmsMstPeriodVersionRepository.GetAll().AsNoTracking()
                                    join pro in _mstBmsPeriodRepository.GetAll().AsNoTracking()
                                    on version.PeriodId equals pro.Id

                                    join mstVersion in _bmsMstVersionRepository.GetAll().AsNoTracking()
                                    on version.VersionId equals mstVersion.Id

                                    where (version.PeriodId == searchPeriodVersionDto.PeriodId)
                                    select new BmsPeriodVersionDto
                                    {
                                        Id = version.Id,
                                        PeriodName = pro.PeriodName,
                                        VersionName = mstVersion.VersionName,
                                        IsActive = version.IsActive,
                                        Description = version.Description,
                                    };
            var result = periodVersionEnum.Skip(searchPeriodVersionDto.SkipCount).Take(searchPeriodVersionDto.MaxResultCount);
            return new PagedResultDto<BmsPeriodVersionDto>(
                       periodVersionEnum.Count(),
                       result.ToList()
                      );
        }

        public async Task<List<BmsPeriodVersionDto>> getAllVersionByPeriodIdNoPage(long id)
        {
            var periodVersionEnum = from version in _bmsMstPeriodVersionRepository.GetAll().AsNoTracking()
                                    join pro in _mstBmsPeriodRepository.GetAll().AsNoTracking()
                                    on version.PeriodId equals pro.Id

                                    join mstVersion in _bmsMstVersionRepository.GetAll().AsNoTracking()
                                    on version.VersionId equals mstVersion.Id

                                    where (version.PeriodId == id)
                                    select new BmsPeriodVersionDto
                                    {
                                        Id = version.Id,
                                        PeriodName = pro.PeriodName,
                                        VersionName = mstVersion.VersionName,
                                        IsActive = version.IsActive,
                                        Description = version.Description,
                                    };
            return periodVersionEnum.ToList();
        }

        public async Task<List<MstVersionDto>> getAllMstVersionNoPage()
        {
            var mstVersionEnum = from version in _bmsMstVersionRepository.GetAll().AsNoTracking()
                                 select new MstVersionDto
                                 {
                                     Id = version.Id,
                                     VersionName = version.VersionName,
                                 };
            return mstVersionEnum.ToList();
        }

        public async Task<InputPeriodVersionDto> LoadById(long id)
        {
            var versionEnum = from version in _bmsMstPeriodVersionRepository.GetAll().AsNoTracking()
                              where version.Id == id
                              select new InputPeriodVersionDto
                              {
                                  Id = version.Id,
                                  PeriodId = version.PeriodId,
                                  VersionId = version.VersionId,
                                  Description = version.Description,
                                  IsActive = version.IsActive
                              };
            return versionEnum.FirstOrDefault();
        }

        public async Task<ValPeriodSaveDto> Save(InputPeriodVersionDto inputPeriodVersionDto)
        {
            ValPeriodSaveDto result = new ValPeriodSaveDto();
            if (inputPeriodVersionDto.Id == 0)
            {
                //Check duplicate for create
                var period = await _bmsMstPeriodVersionRepository.FirstOrDefaultAsync(e => e.VersionId.Equals(inputPeriodVersionDto.VersionId) && e.PeriodId == inputPeriodVersionDto.PeriodId);
                result.Name = period != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputPeriodVersionDto);
                }
            }
            else
            {
                //Check duplicate for edit
                var period = await _bmsMstPeriodVersionRepository.FirstOrDefaultAsync(e => e.VersionId.Equals(inputPeriodVersionDto.VersionId) && e.Id != inputPeriodVersionDto.Id && e.PeriodId == inputPeriodVersionDto.PeriodId);
                result.Name = period != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputPeriodVersionDto);
                }
            }
            return result;
        }

        private async Task Create(InputPeriodVersionDto inputPeriodVersionDto)
        {
            BmsMstPeriodVersion version = new BmsMstPeriodVersion();
            version = ObjectMapper.Map<BmsMstPeriodVersion>(inputPeriodVersionDto);
            await _bmsMstPeriodVersionRepository.InsertAsync(version);
        }

        private async Task Update(InputPeriodVersionDto inputPeriodVersionDto)
        {
            BmsMstPeriodVersion version = await _bmsMstPeriodVersionRepository.FirstOrDefaultAsync(p => p.Id == inputPeriodVersionDto.Id);
            version.PeriodId = inputPeriodVersionDto.PeriodId;
            version.VersionId = inputPeriodVersionDto.VersionId;
            version.IsActive = inputPeriodVersionDto.IsActive;
            version.Description = inputPeriodVersionDto.Description;
            //version = ObjectMapper.Map<BmsMstPeriodVersion>(inputPeriodVersionDto);
            await _bmsMstPeriodVersionRepository.UpdateAsync(version);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task<byte[]> GetPeriodVersionToExcel(SearchPeriodVersionDto searchPeriodVersionDto)
        {
            var periodVersionEnum = await getAllVersionByPeriodIdNoPage(searchPeriodVersionDto.PeriodId);

            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            var v_list_export_excel = periodVersionEnum.ToList();
            List<string> list = new List<string>();
            list.Add("PeriodName");
            list.Add("VersionName");
            list.Add("Description");
            list.Add("StatusString");

            List<string> listHeader = new List<string>();
            listHeader.Add("Period name");
            listHeader.Add("Version name");
            listHeader.Add("Description");
            listHeader.Add("Status");

            string[] properties = list.ToArray();
            string[] p_header = listHeader.ToArray();
            Commons.FillExcel(v_list_export_excel, v_worksheet, 1, 0, properties, p_header);

            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            xlWorkBook.Save(tempFile);
            var tempFile2 = Commons.SetAutoFit(tempFile, p_header.Length);
            byte[] fileByte = await File.ReadAllBytesAsync(tempFile2);
            File.Delete(tempFile);
            File.Delete(tempFile2);
            return fileByte;
        }

        public async Task<List<PeriodAndVersionDto>> GetAllPersiodAndVersion()
        {
            var persiodAndVersionEnum = from period in _mstBmsPeriodRepository.GetAll().AsNoTracking()
                                        join pv in _bmsMstPeriodVersionRepository.GetAll().AsNoTracking()
                                        on period.Id equals pv.PeriodId
                                        join v in _bmsMstVersionRepository.GetAll().AsNoTracking()
                                        on pv.VersionId equals v.Id
                                        select new PeriodAndVersionDto
                                        {
                                            PeriodId = period.Id,
                                            PeriodName = period.PeriodName,
                                            PeritodYear = period.PeriodYear,
                                            PeriodVersionId = pv.Id,
                                            PerisodVersionName = v.VersionName
                                        };
            return persiodAndVersionEnum.ToList();
        }
    }
}
