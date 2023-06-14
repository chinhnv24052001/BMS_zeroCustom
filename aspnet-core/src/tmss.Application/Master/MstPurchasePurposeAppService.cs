using Abp.Application.Services.Dto;
using Abp.AspNetZeroCore.Net;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Abp.UI;
using GemBox.Spreadsheet;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NPOI.SS.Formula.PTG;
using Org.BouncyCastle.Bcpg.OpenPgp;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Core.Master.Period;
using tmss.Dto;
using tmss.EntityFrameworkCore;
using tmss.ImportExcel.PurchasePurpose.Dto;
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.PurchasePurpose;
using tmss.Master.PurchasePurpose.Dto;
using tmss.Storage;

namespace tmss.Master
{
    public class MstPurchasePurposeAppService : tmssAppServiceBase, IMstPurchasePurposeAppService
    {

        private readonly IRepository<MstPurchasePurpose, long> _mstPurchasePurposeRepository;
        private readonly ITempFileCacheManager _tempFileCacheManager;
        public MstPurchasePurposeAppService(IRepository<MstPurchasePurpose, long> mstPurchasePurposeRepository,
            ITempFileCacheManager tempFileCacheManager)
        {
            _mstPurchasePurposeRepository = mstPurchasePurposeRepository;
            _tempFileCacheManager = tempFileCacheManager;
        }

        [AbpAuthorize(AppPermissions.PurchasePurpose_Search)]
        public async Task<PagedResultDto<GetPurchasePurposeDto>> getAllPurchasePurpose(SearchPurchasePurposeDto searchPurchasePurposeDto)
        {
            var listPurchasePurpose = from purchasePurpose in _mstPurchasePurposeRepository.GetAll().AsNoTracking()
                                      where (string.IsNullOrWhiteSpace(searchPurchasePurposeDto.PurchasePurposeName) || purchasePurpose.PurchasePurposeName.Contains(searchPurchasePurposeDto.PurchasePurposeName))
                                      select new GetPurchasePurposeDto()
                                      {
                                          Id = purchasePurpose.Id,
                                          PurchasePurposeName = purchasePurpose.PurchasePurposeName,
                                          PurchasePurposeCode = purchasePurpose.PurchasePurposeCode,
                                          HaveBudgetCode = purchasePurpose.HaveBudgetCode,
                                          Status = purchasePurpose.Status == 1 ? AppConsts.Active : AppConsts.InActive,
                                      };
            var result = listPurchasePurpose.Skip(searchPurchasePurposeDto.SkipCount).Take(searchPurchasePurposeDto.MaxResultCount);
            return new PagedResultDto<GetPurchasePurposeDto>(
                       listPurchasePurpose.Count(),
                       result.ToList()
                      );

        }

        public async Task<InputPurchasePurposeDto> LoadById(long id)
        {
            var listPurchasePurpose = from purchasePurpose in _mstPurchasePurposeRepository.GetAll().AsNoTracking()
                                      where purchasePurpose.Id == id
                                      select new InputPurchasePurposeDto()
                                      {
                                          Id = purchasePurpose.Id,
                                          PurchasePurposeName = purchasePurpose.PurchasePurposeName,
                                          PurchasePurposeCode = purchasePurpose.PurchasePurposeCode,
                                          HaveBudgetCode = purchasePurpose.HaveBudgetCode,
                                          Status = purchasePurpose.Status
                                      };
            return listPurchasePurpose.FirstOrDefault();
        }

        public async Task<ValInventoryGroupDto> Save(InputPurchasePurposeDto inputPurchasePurposeDto)
        {
            ValInventoryGroupDto result = new ValInventoryGroupDto();
            string errMsg = IsDataValid(inputPurchasePurposeDto);
            if (!string.IsNullOrEmpty(errMsg))
            {

                throw new UserFriendlyException(400, errMsg);
            }
            else
            {
                if (inputPurchasePurposeDto.Id == 0)
                {
                    //Check duplicate for create
                    var purchasePurpose = await _mstPurchasePurposeRepository.FirstOrDefaultAsync(e => e.PurchasePurposeCode.Equals(inputPurchasePurposeDto.PurchasePurposeCode));
                    result.Code = purchasePurpose != null ? AppConsts.DUPLICATE_CODE : null;
                    if (result.Code != null)
                    {
                        return result;
                    }
                    else
                    {
                        await Create(inputPurchasePurposeDto);

                    }
                }
                else
                {
                    //Check duplicate for edit
                    var purchasePurpose = await _mstPurchasePurposeRepository.FirstOrDefaultAsync(e => e.PurchasePurposeCode.Equals(inputPurchasePurposeDto.PurchasePurposeCode) && e.Id != inputPurchasePurposeDto.Id);
                    result.Code = purchasePurpose != null ? AppConsts.DUPLICATE_CODE : null;
                    if (result.Code != null)
                    {
                        return result;
                    }
                    else
                    {
                        await Update(inputPurchasePurposeDto);
                    }
                }
            }

            return result;
        }
        private string IsDataValid(InputPurchasePurposeDto inputPurchasePurposeDto)
        {
            MstPurchasePurpose mstPurchasePurpose = _mstPurchasePurposeRepository.GetAll().Where(p => p.PurchasePurposeName.Equals(inputPurchasePurposeDto.PurchasePurposeName) && p.Id != inputPurchasePurposeDto.Id).FirstOrDefault();
            if (mstPurchasePurpose != null)
            {
                return L(AppConsts.PurchasePurposeNameDuplicateMessage);
            }
            return "";
        }

        [AbpAuthorize(AppPermissions.PurchasePurpose_Add)]
        private async Task Create(InputPurchasePurposeDto inputPurchasePurposeDto)
        {
            MstPurchasePurpose mstPurchasePurpose = new MstPurchasePurpose();
            mstPurchasePurpose = ObjectMapper.Map<MstPurchasePurpose>(inputPurchasePurposeDto);
            await _mstPurchasePurposeRepository.InsertAsync(mstPurchasePurpose);
        }

        [AbpAuthorize(AppPermissions.PurchasePurpose_Edit)]
        private async Task Update(InputPurchasePurposeDto inputPurchasePurposeDto)
        {
            MstPurchasePurpose mstPurchasePurpose = await _mstPurchasePurposeRepository.FirstOrDefaultAsync(p => p.Id == inputPurchasePurposeDto.Id);
            mstPurchasePurpose.PurchasePurposeName = inputPurchasePurposeDto.PurchasePurposeName;
            mstPurchasePurpose.PurchasePurposeCode = inputPurchasePurposeDto.PurchasePurposeCode;
            mstPurchasePurpose.HaveBudgetCode = inputPurchasePurposeDto.HaveBudgetCode;
            mstPurchasePurpose.Status = inputPurchasePurposeDto.Status.Value;
            //mstCurExchangeRate = ObjectMapper.Map<MstCurExchangeRate>(input);
            await _mstPurchasePurposeRepository.UpdateAsync(mstPurchasePurpose);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        [AbpAuthorize(AppPermissions.PurchasePurpose_Delete)]
        public async Task DeletePurpose(long id)
        {
            MstPurchasePurpose mstPurchasePurpose = await _mstPurchasePurposeRepository.FirstOrDefaultAsync(p => p.Id == id);
            if (mstPurchasePurpose != null)
            {
                await _mstPurchasePurposeRepository.DeleteAsync(id);
            }
            else
            {
                throw new UserFriendlyException(400, L(AppConsts.ValRecordsDelete));
            }
        }

        [AbpAuthorize(AppPermissions.PurchasePurpose_Import)]
        public async Task<bool> CheckSaveAllImport(List<PurchasePurposeImportDto> listPurchasePurposeImportDto)
        {
            return listPurchasePurposeImportDto.Any(p => p.Remark != null);
        }

        [AbpAuthorize(AppPermissions.PurchasePurpose_Import)]
        public async Task SaveAllImport(List<PurchasePurposeImportDto> listPurchasePurposeImportDto)
        {
            InputPurchasePurposeDto inputPurchasePurposeDto = new InputPurchasePurposeDto();
            foreach (var purChasePurpose in listPurchasePurposeImportDto)
            {
                inputPurchasePurposeDto = new InputPurchasePurposeDto();
                inputPurchasePurposeDto.PurchasePurposeName = purChasePurpose.PurchasePurposeName;
                inputPurchasePurposeDto.PurchasePurposeCode = purChasePurpose.PurchasePurposeCode;
                inputPurchasePurposeDto.HaveBudgetCode = purChasePurpose.HaveBudgetCode == 0 ? false : true;
                inputPurchasePurposeDto.Status = purChasePurpose.Status == 0 ? 0 : 1;
                await Create(inputPurchasePurposeDto);
            }
        }

        [AbpAuthorize(AppPermissions.PurchasePurpose_Import)]
        public async Task<FileDto> ExportTemplate()
        {
            try
            {
                string fileName = "CPS_Template_ImportPurchasePurpose.xlsx";

                // Set License
                var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
                SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

                // Path to File Template
                string template = "wwwroot/Excel_Template";
                string path = "";
                path = Path.Combine(Directory.GetCurrentDirectory(), template, fileName);

                var workBook = ExcelFile.Load(path);
                var workSheet = workBook.Worksheets[0];

                MemoryStream stream = new MemoryStream();
                var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
                workBook.Save(tempFile);

                stream = new MemoryStream(File.ReadAllBytes(tempFile));
                _tempFileCacheManager.SetFile(file.FileToken, stream.ToArray());
                File.Delete(tempFile);
                stream.Position = 0;

                return await Task.FromResult(file);
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(00, L(ex.ToString()));
            }
        }
    }
}
