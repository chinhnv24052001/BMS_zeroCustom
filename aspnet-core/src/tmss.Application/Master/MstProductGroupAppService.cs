using Abp.Application.Services.Dto;
using System;
using System.Linq;
using System.Threading.Tasks;
using Abp.Dapper.Repositories;
using tmss.Authorization.Users;
using System.Collections.Generic;
using tmss.Master.Dto;
using GemBox.Spreadsheet;
using tmss.Common;
using System.IO;
using tmss.Dto;
using Abp.AspNetZeroCore.Net;
using tmss.Storage;
using tmss.Master.Project.DTO;
using tmss.Master.MstQuotaExpense.DTO;
using tmss.Authorization;
using Abp.Authorization;

namespace tmss.Master
{
    public class MstProductGroupAppService : tmssAppServiceBase, IMstProductGroupAppService
    {
        private readonly IDapperRepository<User, long> _dapper;
        private readonly ITempFileCacheManager _tempFileCacheManager;

        public MstProductGroupAppService(IDapperRepository<User, long> dapper, ITempFileCacheManager tempFileCacheManager)
        {
            _dapper = dapper;
            _tempFileCacheManager = tempFileCacheManager;
        }

        [AbpAuthorize(AppPermissions.ProductGroup_Search)]
        public async Task<PagedResultDto<MstProductGroupDto>> getProductGroupSearch(InputSearchMstProuctGroup input)
        {
            string _sql = "EXEC sp_MstProductGroupSearch @p_code, @p_name,@MaxResultCount, @SkipCount";
            var list = (await _dapper.QueryAsync<MstProductGroupDto>(_sql, new
            {
                @p_code = input.Code,
                @p_name = input.Name,
                @MaxResultCount = input.MaxResultCount,
                @SkipCount = input.SkipCount,
            })).ToList();
       
            return new PagedResultDto<MstProductGroupDto>(
                       list.Count,
                       list
                      );
        }

        [AbpAuthorize(AppPermissions.ProductGroup_Export)]
        public async Task<byte[]> MstProductGroupExportExcel(InputProductGroupDto input)
        {
            string _sql = "EXEC sp_MstProductGroupExcel @p_project_code, @p_project_name";
            var listData = (await _dapper.QueryAsync<MstProductGroupDto>(_sql, new
            {
                @p_project_code = input.Code,
                @p_project_name = input.Name
            })).ToList();


            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            var v_list_export_excel = listData.ToList();
            List<string> list = new List<string>();
            list.Add("ProductGroupCode");
            list.Add("ProductGroupName");
            list.Add("ParentId");
            list.Add("Status");


            List<string> listHeader = new List<string>();
            listHeader.Add("Product Group Code");
            listHeader.Add("Product Group Name");
            listHeader.Add("ParentId");
            listHeader.Add("Status");

            string[] properties = list.ToArray();
            string[] p_header = listHeader.ToArray();
            Commons.FillExcel(v_list_export_excel, v_worksheet, 1, 0, properties, p_header);

            Commons.ExcelFormatDate(v_worksheet, 5);
            Commons.ExcelFormatDate(v_worksheet, 6);


            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            xlWorkBook.Save(tempFile);
            var tempFile2 = Commons.SetAutoFit(tempFile, p_header.Length);
            byte[] fileByte = await File.ReadAllBytesAsync(tempFile2);
            File.Delete(tempFile);
            File.Delete(tempFile2);

            return fileByte;
        }

        public async Task<List<MstProductGroupDto>> MstProductGroupGetParentId(long p_id)
        {
            string _sqlIns = "EXEC sp_MstProductGroupGetParentId @p_id";
           return (await _dapper.QueryAsync<MstProductGroupDto>(_sqlIns, new
            {
                @p_id = p_id
            })).ToList();
        }

        [AbpAuthorize(AppPermissions.ProductGroup_Add)]
        public async Task<string> MstProductGroupInsert(MstProductGroupDto dto)
        {
            // Check Exists
            string _sql = "EXEC sp_MstProductGroupCheckExists @p_project_code";
            var list = (await _dapper.QueryAsync<ExistIdMstProject>(_sql, new
            {
                @p_project_code = dto.ProductGroupCode
            })).ToList();
            if (list[0].CountItem > 0)
                return "Error: Data Exists!";
            string _sqlIns = "EXEC sp_MstProductGroupAdd @p_code, @p_name, @p_ParentId, @p_user";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                @p_code = dto.ProductGroupCode,
                @p_name = dto.ProductGroupName,
                @p_ParentId = dto.ParentId,       
                @p_user = AbpSession.UserId
            });
            return "Info: Save successfully!";
        }

        [AbpAuthorize(AppPermissions.ProductGroup_Edit)]
        public async Task<string> MstProductGroupUpdate(MstProductGroupDto dto)
        {
            string _sqlIns = "EXEC sp_MstProductGroupUpdate @p_id,@p_code, @p_name, @p_ParentId, @p_user, @p_Status";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                @p_id = dto.Id,
                @p_code = dto.ProductGroupCode,
                @p_name = dto.ProductGroupName,
                @p_ParentId = dto.ParentId,
                @p_user = AbpSession.UserId,
                @p_Status = dto.Status
            });
            return "Info: Save successfully!";
        }
    }
}

