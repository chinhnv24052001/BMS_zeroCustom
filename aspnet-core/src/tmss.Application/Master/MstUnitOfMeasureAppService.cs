using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.ObjectMapping;
using Abp.Runtime.Session;
using Abp.UI;
using AutoMapper;
using GemBox.Spreadsheet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Common;
using tmss.Master;
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.PurchasePurpose;
using tmss.Master.PurchasePurpose.Dto;
using tmss.Master.UnitOfMeasure;
using tmss.Master.UnitOfMeasure.Dto;

namespace tmss.Master
{
    public class MstUnitOfMeasureAppService : tmssAppServiceBase, IMstUnitOfMeasureAppService
    {
        private readonly IRepository<MstUnitOfMeasure, long> _mstMstUnitOfMeasureRepository;
        public MstUnitOfMeasureAppService(IRepository<MstUnitOfMeasure, long> mstMstUnitOfMeasureRepository)
        {
            _mstMstUnitOfMeasureRepository = mstMstUnitOfMeasureRepository;
        }

        [AbpAuthorize(AppPermissions.UnitOfMeasure_Delete)]
        public async Task Delete(long id)
        {
            MstUnitOfMeasure mstUnitOfMeasure = await _mstMstUnitOfMeasureRepository.FirstOrDefaultAsync(p => p.Id == id);
            if (mstUnitOfMeasure != null)
            {
                await _mstMstUnitOfMeasureRepository.DeleteAsync(id);
            }
            else
            {
                throw new UserFriendlyException(400, AppConsts.ValRecordsDelete);
            }
        }

        [AbpAuthorize(AppPermissions.UnitOfMeasure_Search)]
        public async Task<PagedResultDto<UnitOfMeasureDto>> getAllMeasureDto(UnitOfMeasureInputSearchDto unitOfMeasureInputSearchDto)
        {
            //var _listUnitOfMeasure =  _mstMstUnitOfMeasureRepository.GetAll().Select(e=>e.Id).ToList();
            var listUnitOfMeasure = from unitOfMeasure in _mstMstUnitOfMeasureRepository.GetAll().AsNoTracking()
                                    where ((string.IsNullOrWhiteSpace(unitOfMeasureInputSearchDto.UnitOfMeasure) || unitOfMeasure.UnitOfMeasure.Contains(unitOfMeasureInputSearchDto.UnitOfMeasure))
                                    && (string.IsNullOrWhiteSpace(unitOfMeasureInputSearchDto.UOMCode) || unitOfMeasure.UOMCode.Contains(unitOfMeasureInputSearchDto.UOMCode))
                                    && (string.IsNullOrWhiteSpace(unitOfMeasureInputSearchDto.UOMClass) || unitOfMeasure.UOMClass.Contains(unitOfMeasureInputSearchDto.UOMClass))
                                     /*&& (string.IsNullOrWhiteSpace(unitOfMeasureInputSearchDto.Description) || unitOfMeasure.Description.Contains(unitOfMeasureInputSearchDto.Description))*/)
                                    select new UnitOfMeasureDto()
                                    {
                                        Id = unitOfMeasure.Id,
                                        UnitOfMeasure = unitOfMeasure.UnitOfMeasure,
                                        UOMCode = unitOfMeasure.UOMCode,
                                        UOMClass = unitOfMeasure.UOMClass,
                                        Description = unitOfMeasure.Description,
                                        Status = unitOfMeasure.Status,
                                    };
            var result = listUnitOfMeasure.Skip(unitOfMeasureInputSearchDto.SkipCount).Take(unitOfMeasureInputSearchDto.MaxResultCount);
            return new PagedResultDto<UnitOfMeasureDto>(
                       listUnitOfMeasure.Count(),
                       result.ToList()
                      );
        }

        [AbpAuthorize(AppPermissions.UnitOfMeasure_Edit)]
        public async Task<UnitOfMeasureDto> LoadById(long id)
        {
            var listUnitOfMeasure = from unitOfMeasure in _mstMstUnitOfMeasureRepository.GetAll().AsNoTracking()
                                    where unitOfMeasure.Id == id
                                    select new UnitOfMeasureDto()
                                    {
                                        Id = unitOfMeasure.Id,
                                        UnitOfMeasure = unitOfMeasure.UnitOfMeasure,
                                        UOMCode = unitOfMeasure.UOMCode,
                                        UOMClass = unitOfMeasure.UOMClass,
                                        Description = unitOfMeasure.Description,
                                        Status = unitOfMeasure.Status,
                                    };
            return listUnitOfMeasure.FirstOrDefault();
        }

        public async Task<ValInventoryGroupDto> Save(UnitOfMeasureDto unitOfMeasureDto)
        {
            ValInventoryGroupDto result = new ValInventoryGroupDto();

            if (unitOfMeasureDto.Id == 0)
            {
                //Check duplicate for create
                var unitOfMeasure = await _mstMstUnitOfMeasureRepository.FirstOrDefaultAsync(e => e.UnitOfMeasure.Equals(unitOfMeasureDto.UnitOfMeasure));
                result.Name = unitOfMeasure != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Create(unitOfMeasureDto);

                }
            }
            else
            {
                //Check duplicate for edit
                var unitOfMeasure = await _mstMstUnitOfMeasureRepository.FirstOrDefaultAsync(e => e.UnitOfMeasure.Equals(unitOfMeasureDto.UnitOfMeasure) && e.Id != unitOfMeasureDto.Id);
                result.Name = unitOfMeasure != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Update(unitOfMeasureDto);
                }
            }

            return result;
        }

        //private string IsDataValid(UnitOfMeasureDto unitOfMeasureDto)
        //{
        //    MstUnitOfMeasure mstUnitOfMeasureDto = _mstMstUnitOfMeasureRepository.GetAll().Where(p => p.UnitOfMeasure.Equals(unitOfMeasureDto.UnitOfMeasure) && p.Id != unitOfMeasureDto.Id).FirstOrDefault();
        //    if (mstUnitOfMeasureDto != null)
        //    {
        //        return AppConsts.UnitOfMeasureNameDuplicateMessage;
        //    }
        //    return "";
        //}

        [AbpAuthorize(AppPermissions.UnitOfMeasure_Add)]
        private async Task Create(UnitOfMeasureDto unitOfMeasureDto)
        {
            MstUnitOfMeasure mstUnitOfMeasure = new MstUnitOfMeasure();
            //mstUnitOfMeasure = ObjectMapper.Map<MstUnitOfMeasure>(unitOfMeasureDto);
            mstUnitOfMeasure.UnitOfMeasure = unitOfMeasureDto.UnitOfMeasure;
            mstUnitOfMeasure.UOMCode = unitOfMeasureDto.UOMCode;
            mstUnitOfMeasure.UOMClass = unitOfMeasureDto.UOMClass;
            mstUnitOfMeasure.Description = unitOfMeasureDto.Description;
            mstUnitOfMeasure.Status = unitOfMeasureDto.Status;

            mstUnitOfMeasure.CreationTime = DateTime.Now;
            mstUnitOfMeasure.CreatorUserId = AbpSession.GetUserId();
            await _mstMstUnitOfMeasureRepository.InsertAsync(mstUnitOfMeasure);
        }

        [AbpAuthorize(AppPermissions.UnitOfMeasure_Edit)]
        private async Task Update(UnitOfMeasureDto unitOfMeasureDto)
        {
            MstUnitOfMeasure mstUnitOfMeasure = await _mstMstUnitOfMeasureRepository.FirstOrDefaultAsync(p => p.Id == unitOfMeasureDto.Id);
            mstUnitOfMeasure.UnitOfMeasure = unitOfMeasureDto.UnitOfMeasure;
            mstUnitOfMeasure.UOMCode = unitOfMeasureDto.UOMCode;
            mstUnitOfMeasure.UOMClass = unitOfMeasureDto.UOMClass;
            mstUnitOfMeasure.Description = unitOfMeasureDto.Description;
            mstUnitOfMeasure.Status = unitOfMeasureDto.Status;
            mstUnitOfMeasure.LastModificationTime = DateTime.Now;
            mstUnitOfMeasure.LastModifierUserId = AbpSession.GetUserId();
            //mstCurExchangeRate = ObjectMapper.Map<MstCurExchangeRate>(input);
            await _mstMstUnitOfMeasureRepository.UpdateAsync(mstUnitOfMeasure);

            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [AbpAuthorize(AppPermissions.UnitOfMeasure_Search)]
        public async Task<List<UnitOfMeasureDto>> getAllUmoNotPaged(SearchUnitOfMeasureNotPagedDto searchUnitOfMeasureNotPagedDto)
        {
            var listUom = from uom in _mstMstUnitOfMeasureRepository.GetAll().AsNoTracking()
                          where ((string.IsNullOrWhiteSpace(searchUnitOfMeasureNotPagedDto.UnitOfMeasure) || uom.UnitOfMeasure.Contains(searchUnitOfMeasureNotPagedDto.UnitOfMeasure)))
                          select new UnitOfMeasureDto()
                          {
                              Id = uom.Id,
                              UnitOfMeasure = uom.UnitOfMeasure,
                              Description = uom.Description,
                              UOMClass = uom.UOMClass,
                              UOMCode = uom.UOMCode,
                              Status = uom.Status
                          };
            return listUom.ToList();
        }

        [AbpAuthorize(AppPermissions.UnitOfMeasure_Export)]
        public async Task<byte[]> MstOUMExportExcel(InputUOMExportDto input)
        {

            var listUnitOfMeasure = from unitOfMeasure in _mstMstUnitOfMeasureRepository.GetAll().AsNoTracking()
                                    where ((string.IsNullOrWhiteSpace(input.UnitOfMeasure) || unitOfMeasure.UnitOfMeasure.Contains(input.UnitOfMeasure))
                                    && (string.IsNullOrWhiteSpace(input.UOMCode) || unitOfMeasure.UOMCode.Contains(input.UOMCode))
                                    && (string.IsNullOrWhiteSpace(input.UOMClass) || unitOfMeasure.UOMClass.Contains(input.UOMClass))
                                     /*&& (string.IsNullOrWhiteSpace(unitOfMeasureInputSearchDto.Description) || unitOfMeasure.Description.Contains(unitOfMeasureInputSearchDto.Description))*/)
                                    select new UnitOfMeasureDto()
                                    {
                                        Id = unitOfMeasure.Id,
                                        UnitOfMeasure = unitOfMeasure.UnitOfMeasure,
                                        UOMCode = unitOfMeasure.UOMCode,
                                        UOMClass = unitOfMeasure.UOMClass,
                                        Description = unitOfMeasure.Description,
                                        Status = unitOfMeasure.Status,
                                    };
            var result = listUnitOfMeasure.ToList();
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            var v_list_export_excel = result.ToList();
            List<string> list = new List<string>();
            list.Add("UnitOfMeasure");
            list.Add("UOMCode");
            list.Add("UOMClass");
            list.Add("Description");
            list.Add("Status");

            List<string> listHeader = new List<string>();
            listHeader.Add("Unit Of Measure");
            listHeader.Add("UOM Code");
            listHeader.Add("UOM Class");
            listHeader.Add("Description");
            listHeader.Add("Status");

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
