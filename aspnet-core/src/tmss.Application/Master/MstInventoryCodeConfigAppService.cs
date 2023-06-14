using Abp.Application.Services.Dto;
using Abp.AspNetZeroCore.Net;
using Abp.Authorization;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using GemBox.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Authorization.Users;
using tmss.Common;
using tmss.Dto;
using tmss.Master.InventoryCodeConfig;
using tmss.Master.InventoryCodeConfig.Dto;
using tmss.Master.InventoryGroup.Dto;
using tmss.Storage;

namespace tmss.Master
{
    public class MstInventoryCodeConfigAppService : tmssAppServiceBase, IMstInventoryCodeConfigAppService
    {
        private readonly IDapperRepository<User, long> _dapper;
        private readonly IRepository<MstInventoryGroup, long> _mstInventoryGroupRepository;
        private readonly ITempFileCacheManager _tempFileCacheManager;

           
        public MstInventoryCodeConfigAppService(
            IDapperRepository<User, long> dapper, 
            IRepository<MstInventoryGroup, long> mstInventoryGroupRepository, 
            ITempFileCacheManager tempFileCacheManager)
        {
            _dapper = dapper;
            _mstInventoryGroupRepository = mstInventoryGroupRepository;
            _tempFileCacheManager = tempFileCacheManager;
        }
        [AbpAuthorize(AppPermissions.InventoryCodeConfig_Search)]
        public async Task<PagedResultDto<MstInventoryCodeConfigDto>> getMstInventoryCodeConfigSearch(InputSearchInventoryCodeConfigDto input)
        {
            string _sql = "EXEC sp_MstInventoryCodeConfigSearch @p_inventoryCode, @p_inventoryName, @MaxResultCount, @SkipCount";
            var list = (await _dapper.QueryAsync<MstInventoryCodeConfigDto>(_sql, new
            {
                @p_inventoryCode = input.InventoryGroupCode,
                @p_inventoryName = input.InventoryGroupName,
                @MaxResultCount = input.MaxResultCount,
                @SkipCount = input.SkipCount,
            })).ToList();

            return new PagedResultDto<MstInventoryCodeConfigDto>(
                       list.Count,
                       list
                      );
        }
        [AbpAuthorize(AppPermissions.InventoryCodeConfig_Export)]
        public async Task<byte[]> MstInventoryCodeConfigExportExcel(InputSearchInventoryCodeConfigDto input)
        {
            string _sql = "EXEC sp_MstInventoryCodeConfigExcel @p_inventoryCode, @p_inventoryName";
            var listData = (await _dapper.QueryAsync<MstInventoryCodeConfigDto>(_sql, new
            {
                p_inventoryCode = input.InventoryGroupCode,
                p_inventoryName = input.InventoryGroupName
            })).ToList();


            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            var v_list_export_excel = listData.ToList();
            List<string> list = new List<string>();
            list.Add("InventoryGroupCode");
            list.Add("InventoryGroupName");
            list.Add("CodeHeader");
            list.Add("StartNum");
            list.Add("EndNum");
            list.Add("CurrentNum");
            list.Add("Status");


            List<string> listHeader = new List<string>();
            listHeader.Add("Inventory Group Code");
            listHeader.Add("Inventory Group Name");
            listHeader.Add("Code Header");
            listHeader.Add("Start Number");
            listHeader.Add("End Number");
            listHeader.Add("Current Number");
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
        [AbpAuthorize(AppPermissions.InventoryCodeConfig_Add)]
        public async Task<string> MstInventoryCodeConfigInsert(MstInventoryCodeConfigDto dto)
        {
            // Check Exists
            //string _sql = "EXEC sp_MstProjectCheckExists @p_project_code";
            //var list = (await _dapper.QueryAsync<MstInventoryCodeConfigDto>(_sql, new
            //{
            //    @p_project_code = dto.ProjectCode
            //})).ToList();
            //if (list[0].CountItem > 0)
            //    return "Error: Data Exists!";
            string _sqlIns = "EXEC sp_MstInventoryCodeConfigInsert @p_InventoryGroupCode, @p_InventoryGroupName, @p_CodeHeader, @p_StartNum, @p_EndNum, @p_CurrentNum, @p_user,@p_DocCode";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                p_InventoryGroupCode = dto.InventoryGroupCode,
                p_InventoryGroupName = dto.InventoryGroupName,
                p_CodeHeader = dto.CodeHeader,
                p_StartNum = dto.StartNum,
                p_EndNum = dto.EndNum,
                p_CurrentNum = dto.CurrentNum,
                p_user = AbpSession.UserId,
                p_DocCode = dto.DocCode
            });
            return "Info: Save successfully!";
        }
        [AbpAuthorize(AppPermissions.InventoryCodeConfig_Edit)]
        public async Task<string> MstInventoryCodeConfigUpdate(MstInventoryCodeConfigDto dto)
        {
            string _sqlIns = "EXEC sp_MstInventoryCodeConfigUpdate @p_InventoryGroupCode, @p_InventoryGroupName, @p_CodeHeader, @p_StartNum, @p_EndNum, @p_CurrentNum, @p_user, @p_status, @p_id, @p_DocCode";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                p_InventoryGroupCode = dto.InventoryGroupCode,
                p_InventoryGroupName = dto.InventoryGroupName,
                p_CodeHeader = dto.CodeHeader,
                p_StartNum = dto.StartNum,
                p_EndNum = dto.EndNum,
                p_CurrentNum = dto.CurrentNum,
                p_user = AbpSession.UserId,
                p_status = dto.Status,
                p_id = dto.Id,
                p_DocCode = dto.DocCode
            });
            return "Info: Save successfully!";
        }
        public async Task<List<MstInventoryCodeConfigDto>> getAllInventoryGroup()
        {
            string _sql = "EXEC sp_MstGetAllDocCode";
            var list = (await _dapper.QueryAsync<MstInventoryCodeConfigDto>(_sql)).ToList();
            return list;
            ;
        }
    }
}

