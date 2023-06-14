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
using Abp.Authorization;
using tmss.Authorization;

namespace tmss.Master
{
    public class MstProjectAppService : tmssAppServiceBase, IMstProjectAppService
    {
        private readonly IDapperRepository<User, long> _dapper;
        private readonly ITempFileCacheManager _tempFileCacheManager;

        public MstProjectAppService(IDapperRepository<User, long> dapper, ITempFileCacheManager tempFileCacheManager)
        {
            _dapper = dapper;
            _tempFileCacheManager = tempFileCacheManager;
        }

        public async Task<List<MstProjectDto>> getMstProjectById(decimal p_id)
        {
            string _sql = "EXEC sp_MstProjectGetById @p_id";
            var list = (await _dapper.QueryAsync<MstProjectDto>(_sql, new
            {
                @p_id = p_id
            
            })).ToList();
            return list;
        }

        [AbpAuthorize(AppPermissions.Project_Search)]
        public async Task<PagedResultDto<MstProjectDto>> getMstProjectSearch(InputSearchMstProject input)
        {
            string _sql = "EXEC sp_MstProjectSearch @p_invoice_num, @p_invoice_symbol,@MaxResultCount, @SkipCount";
            var list = (await _dapper.QueryAsync<MstProjectDto>(_sql, new
            {
                @p_invoice_num = input.ProjectCode,
                @p_invoice_symbol = input.ProjectName,
                @MaxResultCount = input.MaxResultCount,
                @SkipCount = input.SkipCount,
            })).ToList();
       
            return new PagedResultDto<MstProjectDto>(
                       list.Count,
                       list
                      );
        }

        [AbpAuthorize(AppPermissions.Project_Export)]
        public async Task<byte[]> MstProjectExportExcel(InputExportProjectDto input)
        {
            string _sql = "EXEC sp_MstProjectExcel @p_project_code, @p_project_name";
            var listData = (await _dapper.QueryAsync<MstProjectDto>(_sql, new
            {
                @p_project_code = input.ProjectCode,
                @p_project_name = input.ProjectName
            })).ToList();


            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            var v_list_export_excel = listData.ToList();
            List<string> list = new List<string>();
            list.Add("ProjectCode");
            list.Add("ProjectName");
            list.Add("Category");
            list.Add("NumberStage");
            list.Add("Status");
            list.Add("StartDateActive");
            list.Add("EndDateActive");


            List<string> listHeader = new List<string>();
            listHeader.Add("Project Code");
            listHeader.Add("Project Name");
            listHeader.Add("Category");
            listHeader.Add("Number Stage");
            listHeader.Add("Status");
            listHeader.Add("Start Date Active");
            listHeader.Add("End Date Active");

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

        [AbpAuthorize(AppPermissions.Project_Add)]
        public async Task<string> MstProjectInsert(MstProjectDto dto)
        {
            // Check Exists
            string _sql = "EXEC sp_MstProjectCheckExists @p_project_code";
            var list = (await _dapper.QueryAsync<ExistIdMstProject>(_sql, new
            {
                @p_project_code = dto.ProjectCode
            })).ToList();
            if (list[0].CountItem > 0)
                return "Error: Data Exists!";
            string _sqlIns = "EXEC sp_MstProjectInsert @p_ProjectCode, @p_ProjectName, @p_NumberStage, @p_StartDateActive, @p_EndDateActive,@p_user,@p_Status,@p_Category";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                @p_ProjectCode = dto.ProjectCode,
                @p_ProjectName = dto.ProjectName,
                @p_NumberStage = dto.NumberStage,
                @p_StartDateActive = dto.StartDateActive,
                @p_EndDateActive = dto.EndDateActive,
                @p_user = AbpSession.UserId,
                @p_Status = dto.Status,
                @p_Category = dto.Category
            });
            return "Info: Save successfully!";
        }

        [AbpAuthorize(AppPermissions.Project_Edit)]
        public async Task<string> MstProjectUpdate(MstProjectDto dto)
        {
            string _sqlIns = "EXEC sp_MstProjectUpdate @p_id, @p_ProjectName, @p_NumberStage, @p_StartDateActive, @p_EndDateActive,@p_user,@p_Status,@p_Category";
            await _dapper.ExecuteAsync(_sqlIns, new
            {
                @p_id = dto.Id,
                @p_ProjectName = dto.ProjectName,
                @p_NumberStage = dto.NumberStage,
                @p_StartDateActive = dto.StartDateActive,
                @p_EndDateActive = dto.EndDateActive,
                @p_user = AbpSession.UserId,
                @p_Status = dto.Status,
                @p_Category = dto.Category
            });
            return "Info: Save successfully!";
        }

        #region export excel
        public async Task<FileDto> MstProjectExportExcelGembox(InputSearchMstProject input)
        {
            string _sql = "EXEC sp_MstProjectExcel @p_project_code, @p_project_name";

            IEnumerable<MstProjectDto> ListData = await _dapper.QueryAsync<MstProjectDto>(_sql,
                     new
                     {
                         p_project_code = input.ProjectCode,
                         p_project_name = input.ProjectName
                     });

            var checkList = from package in ListData
                            select new MstProjectDto()
                            {
                                ProjectCode = package.ProjectCode,
                                ProjectName = package.ProjectName,
                                NumberStage = package.NumberStage,
                                Status = package.Status,
                                StartDateActive = package.StartDateActive,
                                EndDateActive = package.EndDateActive,
                                Category = package.Category,
                            };

            List<MstProjectDto> listExport;
            listExport = checkList.ToList();
            string fileName = $"ListProject{DateTime.Now.ToString("yyyy/MM/dd/ HH:mm")}.xlsx";

            // Set License
            var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

            // Path to File Template
            string p_template = "wwwroot/Excel_Template";
            string path = "";
            path = Path.Combine(Directory.GetCurrentDirectory(), p_template, "MstProjcetTmpl.xlsx");
            var xlWorkBook = ExcelFile.Load(path);
            var v_worksheet = xlWorkBook.Worksheets[0];
            v_worksheet.Cells.GetSubrange($"A4:H{checkList.Count() + 3}").Style.Borders.SetBorders(MultipleBorders.All, SpreadsheetColor.FromName(ColorName.Black), LineStyle.Thin);
            for (var i = 1; i <= checkList.Count(); i++)
            {
                v_worksheet.Cells[$"A{i + 3}"].Value = i;
                v_worksheet.Cells[$"B{i + 3}"].Value = listExport[i - 1].ProjectCode;
                v_worksheet.Cells[$"C{i + 3}"].Value = listExport[i - 1].ProjectName;
                v_worksheet.Cells[$"D{i + 3}"].Value = listExport[i - 1].NumberStage;
                v_worksheet.Cells[$"E{i + 3}"].Value = listExport[i - 1].Status;
                v_worksheet.Cells[$"F{i + 3}"].Value = listExport[i - 1].StartDateActive;
                v_worksheet.Cells[$"F{i + 3}"].Style.NumberFormat = "dd/MM/yyyy";
                v_worksheet.Cells[$"G{i + 3}"].Value = listExport[i - 1].EndDateActive;
                v_worksheet.Cells[$"G{i + 3}"].Style.NumberFormat = "dd/MM/yyyy";
                v_worksheet.Cells[$"H{i + 3}"].Value = listExport[i - 1].Category;
            }

            MemoryStream obj_stream = new MemoryStream();
            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + $".xlsx");
            xlWorkBook.Save(tempFile);


            obj_stream = new MemoryStream(File.ReadAllBytes(tempFile));
            _tempFileCacheManager.SetFile(file.FileToken, obj_stream.ToArray());
            File.Delete(tempFile);
            obj_stream.Position = 0;

            return await Task.Run(() => file);
        }
        #endregion
    }
}

