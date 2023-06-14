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
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.ProcessType.Dto;
using tmss.Master.MstQuotaExpense.DTO;
using Abp.Authorization;
using tmss.Authorization;

namespace tmss.Master
{
    public class MstDocumentAppService : tmssAppServiceBase, IMstDocumentAppService
    {
        private readonly IDapperRepository<User, long> _dapper;

        public MstDocumentAppService(IDapperRepository<User, long> dapper, ITempFileCacheManager tempFileCacheManager)
        {
            _dapper = dapper;
        }
        [AbpAuthorize(AppPermissions.ListOfDocument_Search)]
        public async Task<PagedResultDto<MstDocumentDto>> getMstDocumentSearch(InputSearchMstDocument input)
        {
            string _sql = "EXEC sp_MstDocumentSearch @p_invoice_num, @p_invoice_symbol,@MaxResultCount, @SkipCount";
            var list = (await _dapper.QueryAsync<MstDocumentDto>(_sql, new
            {
                @p_invoice_num = input.Code,
                @p_invoice_symbol = input.Name,
                @MaxResultCount = input.MaxResultCount,
                @SkipCount = input.SkipCount,
            })).ToList();
       
            return new PagedResultDto<MstDocumentDto>(
                       list.Count,
                       list
                      );
        }

        public Task<byte[]> MstDocumentExcel(InputDocumentDto input)
        {
            throw new NotImplementedException();
        }

        [AbpAuthorize(AppPermissions.ListOfDocument_Export)]
        public async Task<byte[]> MstDocumentExportExcel(InputDocumentDto input)
        {
            string _sql = "EXEC sp_MstDocumentExcel @p_Document_code, @p_Document_name";
            var listData = (await _dapper.QueryAsync<MstDocumentDto>(_sql, new
            {
                @p_Document_code = input.Code,
                @p_Document_name = input.Name
            })).ToList();


            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            var v_list_export_excel = listData.ToList();
            List<string> list = new List<string>();
            list.Add("DocumentCode");
            list.Add("DocumentName");
            list.Add("ProcessTypeName");
            list.Add("IsIrregular");           
            list.Add("ProductGroupName");
            list.Add("Leadtime");
            list.Add("Status");

            List<string> listHeader = new List<string>();
            listHeader.Add("Document Code");
            listHeader.Add("Document Name");
            listHeader.Add("Process Type Name");
            listHeader.Add("Irregular");
            listHeader.Add("Product Group Name");
            listHeader.Add("Leadtime");
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
        [AbpAuthorize(AppPermissions.ListOfDocument_Add)]
        public async Task<string> MstDocumentInsert(MstDocumentDto dto)
        {
            // Check Exists
            string _sql = "EXEC sp_MstDocumentCheckExists @p_Document_code";
            var list = (await _dapper.QueryAsync<ExistIdMstDocument>(_sql, new
            {
                @p_Document_code = dto.DocumentCode
            })).ToList();
            if (list[0].CountItem > 0)
                return "Error: Data Exists!";
            string _sqlIns = "EXEC sp_MstDocumentInsert @p_DocumentCode, @p_DocumentName, @p_ProcessTypeId, @p_IsIrregular, @p_InventoryGroupId,@p_Leadtime,@p_user,@p_Status";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                @p_DocumentCode = dto.DocumentCode,
                @p_DocumentName = dto.DocumentName,
                @p_ProcessTypeId = dto.ProcessTypeId,
                @p_IsIrregular = dto.IsIrregular,
                @p_InventoryGroupId = dto.InventoryGroupId,
                @p_Leadtime = dto.Leadtime,
                @p_user = AbpSession.UserId,
                @p_Status = dto.Status
            });
            return "Info: Save successfully!";
        }

        [AbpAuthorize(AppPermissions.ListOfDocument_Edit)]
        public async Task<string> MstDocumentUpdate(MstDocumentDto dto)
        {
            string _sqlIns = "EXEC sp_MstDocumentUpdate @p_id, @p_DocumentName, @p_ProcessTypeId, @p_IsIrregular, @p_InventoryGroupId,@p_Leadtime,@p_user,@p_Status";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                @p_id = dto.Id,
                @p_DocumentName = dto.DocumentName,
                @p_ProcessTypeId = dto.ProcessTypeId,
                @p_IsIrregular = dto.IsIrregular,
                @p_InventoryGroupId = dto.InventoryGroupId,
                @p_Leadtime = dto.Leadtime,
                @p_user = AbpSession.UserId,
                @p_Status = dto.Status
            });
            return "Info: Save successfully!";
        }

        public async Task<List<MasterLookupDto>> MstInventoryGroupGetAll()
        {
            string _sqlIns = "EXEC sp_MstInventoryGroupGetAll";
            return  (await _dapper.QueryAsync<MasterLookupDto>(_sqlIns, new
            {
              
            })).ToList();
        }

        public async Task<List<ProcessTypeGetAllOutputDto>> MstPRoductTypeGetAll()
        {
            string _sqlIns = "EXEC sp_MstProcessTypeGetAll";
            return (await _dapper.QueryAsync<ProcessTypeGetAllOutputDto>(_sqlIns, new
            {

            })).ToList();
        }
    }
}

