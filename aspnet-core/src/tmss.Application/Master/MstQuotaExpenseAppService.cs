using Abp.Application.Services.Dto;
using System.Linq;
using System.Threading.Tasks;
using Abp.Dapper.Repositories;
using tmss.Authorization.Users;
using System.Collections.Generic;
using tmss.Master.Dto;
using GemBox.Spreadsheet;
using tmss.Common;
using System.IO;
using System;
using tmss.Master.MstQuotaExpense.DTO;
using tmss.Authorization;
using Abp.Authorization;

namespace tmss.Master
{
    public class MstQuotaExpenseAppService : tmssAppServiceBase, IMstQuotaExpenseAppService
    {
        private readonly IDapperRepository<User, long> _dapper;
        public MstQuotaExpenseAppService(IDapperRepository<User, long> dapper)
        {
            _dapper = dapper;
        }

        public async Task<List<MstQuotaExpenseDto>> getMstQuotaExpenseById(decimal p_id)
        {
            string _sql = "EXEC sp_MstQuotaExpenseGetById @p_id";
            var list = (await _dapper.QueryAsync<MstQuotaExpenseDto>(_sql, new
            {
                @p_id = p_id
            
            })).ToList();
            return list;
        }

        [AbpAuthorize(AppPermissions.QuotaExpense_Search)]
        public async Task<PagedResultDto<MstQuotaExpenseDto>> getMstQuotaExpenseSearch(InputSearchMstQuotaExpense input)
        {
            string _sql = "EXEC sp_MstQuotaExpenseSearch @p_quota_code, @p_quota_type,@MaxResultCount, @SkipCount";
            var list = (await _dapper.QueryAsync<MstQuotaExpenseDto>(_sql, new
            {
                @p_quota_code = input.QuotaCode,
                @p_quota_type = input.QuoType,
                @MaxResultCount = input.MaxResultCount,
                @SkipCount = input.SkipCount,
            })).ToList();
       
            return new PagedResultDto<MstQuotaExpenseDto>(
                       list.Count,
                       list
                      );
        }

        [AbpAuthorize(AppPermissions.QuotaExpense_Export)]
        public async Task<byte[]> MstQuotaExpenseExportExcel(InputExportQuotaExpenseDto input)
        {
            string _sql = "EXEC sp_MstQuotaExpenseExcel @p_quota_code, @p_quota_type";
            var listData = (await _dapper.QueryAsync<MstQuotaExpenseDto>(_sql, new
            {
                @p_quota_code = input.QuotaCode,
                @p_quota_type = input.QuoType
            })).ToList();


            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            var v_list_export_excel = listData.ToList();
            List<string> list = new List<string>();
            list.Add("QuotaCode");
            list.Add("QuotaName");
            list.Add("OrgName");
            list.Add("TitleName");
            list.Add("QuoTypeStr");
            list.Add("QuotaPrice");
            list.Add("CurrencyName");       
            list.Add("StartDate");
            list.Add("EndDate");
            list.Add("CreationDate");
            list.Add("Status");

            List<string> listHeader = new List<string>();
            listHeader.Add("Code");
            listHeader.Add("Description");
            listHeader.Add("Org Name");
            listHeader.Add("Title Name");
            listHeader.Add("Type");
            listHeader.Add("Quota");
            if (input.QuoType == 1)
            {           
                listHeader.Add("Currency Code");
            }
            else
            {
                listHeader.Add("Unit");
            }    
            listHeader.Add("Start Date");
            listHeader.Add("End Date");
            listHeader.Add("Creation Date");
            listHeader.Add("Status");

            string[] properties = list.ToArray();
            string[] p_header = listHeader.ToArray();
            Commons.FillExcel(v_list_export_excel, v_worksheet, 1, 0, properties, p_header);

            Commons.ExcelFormatDate(v_worksheet, 7);
            Commons.ExcelFormatDate(v_worksheet, 8);
            Commons.ExcelFormatDate(v_worksheet, 9);

            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            xlWorkBook.Save(tempFile);
            var tempFile2 = Commons.SetAutoFit(tempFile, p_header.Length);
            byte[] fileByte = await File.ReadAllBytesAsync(tempFile2);
            File.Delete(tempFile);
            File.Delete(tempFile2);

            return fileByte;
        }

        [AbpAuthorize(AppPermissions.QuotaExpense_Add)]
        public async Task<string> MstQuotaExpenseInsert(MstQuotaExpenseDto dto)
        {
            // Check Exists
            string _sql = "EXEC sp_MstQuotaExpenseCheckExist @p_quota_code";
            var list = (await _dapper.QueryAsync<ExistIdMstQuotaExpense>(_sql, new
            {
                @p_quota_code = dto.QuotaCode
            })).ToList();
            if (list[0].CountItem > 0)
                return "Error: Data Exists!";
            string _sqlIns = "EXEC sp_MstQuotaExpenseInsert @p_quota_code, @p_QuotaName, @p_QuotaType, @P_OrgId, @p_TitleId,@p_QuotaPrice,@p_CurrencyCode,@p_StartDate,@p_EndDate,@p_user,@p_status";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                @p_quota_code = dto.QuotaCode,
                @p_QuotaName = dto.QuotaName,
                @p_QuotaType = dto.QuotaType,
                @P_OrgId = dto.OrgId,
                @p_TitleId = dto.TitleId,
                @p_QuotaPrice = dto.QuotaPrice,
                @p_CurrencyCode = dto.CurrencyCode,
                @p_StartDate = dto.StartDate,
                @p_EndDate = dto.EndDate,
                @p_user = AbpSession.UserId,
                @p_Status = dto.Status
            });
            return "Info: Save successfully!";
        }

        [AbpAuthorize(AppPermissions.QuotaExpense_Edit)]
        public async Task<string> MstQuotaExpenseUpdate(MstQuotaExpenseDto dto)
        {
            string _sqlIns = "EXEC sp_MstQuotaExpenseUpdate @p_id, @p_QuotaCode, @p_QuotaName, @p_QuotaType, @P_OrgId, @p_TitleId,@p_QuotaPrice,@p_CurrencyCode,@p_StartDate,@p_EndDate,@p_user,@p_status";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                @p_id = dto.Id,
                @p_QuotaCode = dto.QuotaCode,
                @p_QuotaName = dto.QuotaName,
                @p_QuotaType = dto.QuotaType,
                @P_OrgId = dto.OrgId,
                @p_TitleId = dto.TitleId,
                @p_QuotaPrice = dto.QuotaPrice,
                @p_CurrencyCode = dto.CurrencyCode,
                @p_StartDate = dto.StartDate,
                @p_EndDate = dto.EndDate,
                @p_user = AbpSession.UserId,
                @p_Status = dto.Status
            });
            return "Info: Save successfully!";
        }


        public async Task<List<MasterLookupDto>> GetAllMstCurrency()
        {
            string _sql = "EXEC sp_MstCurrencyGetAll";
            var list = (await _dapper.QueryAsync<MasterLookupDto>(_sql)).ToList();

            return list;
        }

        public async Task<List<MasterLookupDto>> GetAllMstTitle()
        {
            string _sql = "EXEC sp_MstTitlesGetAll";
            var list = (await _dapper.QueryAsync<MasterLookupDto>(_sql)).ToList();

            return list;
        }

        public async Task<List<MasterLookupDto>> GetAllMstUnitOfMeasure()
        {
            string _sql = "EXEC sp_MstUnitOfMeasureGetAll";
            var list = (await _dapper.QueryAsync<MasterLookupDto>(_sql)).ToList();

            return list;
        }

        public async Task<List<MasterLookupDto>> GetAllMstInventoryGroup()
        {
            string _sql = "EXEC sp_MstInventoryGroupGetAll";
            var list = (await _dapper.QueryAsync<MasterLookupDto>(_sql)).ToList();

            return list;
        }

        public async Task<List<MasterLookupDto>> GetAllMstHrOrgStructure()
        {
            string _sql = "EXEC sp_MstHrOrgStructureGetAll";
            var list = (await _dapper.QueryAsync<MasterLookupDto>(_sql)).ToList();

            return list;
        }
    }
}

