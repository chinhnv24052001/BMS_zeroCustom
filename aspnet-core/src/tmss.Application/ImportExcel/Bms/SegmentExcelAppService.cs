using Abp.AspNetZeroCore.Net;
using Abp.Domain.Repositories;
using Abp.UI;
using GemBox.Spreadsheet;
using Microsoft.AspNetCore.Hosting;
using Microsoft.EntityFrameworkCore;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Period;
using tmss.BMS.Master.Segment1;
using tmss.BMS.Master.Segment2;
using tmss.BMS.Master.Segment3;
using tmss.BMS.Master.Segment4;
using tmss.BMS.Master.Segment5;
using tmss.Core.BMS.Master.Period;
using tmss.Core.Master.Period;
using tmss.Dto;
using tmss.ImportExcel.Bms.Segment;
using tmss.ImportExcel.Bms.Segment.Dto;
using tmss.ImportExcel.PurchasePurpose;
using tmss.ImportExcel.PurchasePurpose.Dto;
using tmss.Master;
using tmss.Master.BMS.Department;
using tmss.Storage;
using Z.EntityFramework.Plus;

namespace tmss.ImportExcel.Bms
{
    public class SegmentExcelAppService : tmssAppServiceBase, ISegmentExcelAppService
    {
        private IWebHostEnvironment _env;
        private readonly IRepository<MstPurchasePurpose, long> _mstPurchasePurposeRepository;
        private readonly IRepository<BmsMstSegment1TypeCost, long> _mstSegment1TypeCostRepository;
        private readonly IRepository<BmsMstPeriod, long> _mstPeriodRepository;
        private readonly IRepository<BmsMstSegment2ProjectType, long> _mstSegment2ProjectTypeRepository;
        private readonly IRepository<BmsMstDepartment, long> _mstDepartmentRepository;
        private readonly IRepository<BmsMstSegment4Group, long> _mstSegment4GroupRepository;
        private readonly IRepository<BmsMstSegment5, long> _mstSegment5Repository;
        private readonly IRepository<BmsMstSegment4, long> _mstSegment4Repository;
        private readonly IRepository<BmsMstSegment3, long> _mstSegment3Repository;
        private readonly IRepository<BmsMstSegment2, long> _mstSegment2Repository;
        private readonly IRepository<BmsMstSegment1, long> _mstSegment1Repository;
        private readonly ITempFileCacheManager _tempFileCacheManager;
        private readonly IRepository<BmsMstPeriodVersion, long> _bmsMstPeriodVersionRepository;
        private readonly IRepository<BmsMstVersion, long> _bmsMstVersionRepository;

        public SegmentExcelAppService(IWebHostEnvironment env,
            IRepository<MstPurchasePurpose, long> mstPurchasePurposeRepository,
            IRepository<BmsMstPeriod, long> mstPeriodRepository,
            IRepository<BmsMstSegment1TypeCost, long> mstSegment1TypeCostRepository,
            IRepository<BmsMstSegment2ProjectType, long> mstSegment2ProjectTypeRepository,
            IRepository<BmsMstDepartment, long> mstDepartmentRepository,
            IRepository<BmsMstSegment4Group, long> mstSegment4GroupRepository,
            IRepository<BmsMstSegment5, long> mstSegment5Repository,
            IRepository<BmsMstSegment4, long> mstSegment4Repository,
            IRepository<BmsMstSegment3, long> mstSegment3Repository,
            IRepository<BmsMstSegment2, long> mstSegment2Repository,
            IRepository<BmsMstSegment1, long> mstSegment1Repository,
            ITempFileCacheManager tempFileCacheManager,
            IRepository<BmsMstPeriodVersion, long> bmsMstPeriodVersionRepository,
            IRepository<BmsMstVersion, long> bmsMstVersionRepository
            )
        {
            _env = env;
            _mstPurchasePurposeRepository = mstPurchasePurposeRepository;
            _mstPeriodRepository = mstPeriodRepository;
            _mstSegment1TypeCostRepository = mstSegment1TypeCostRepository;
            _mstSegment5Repository = mstSegment5Repository;
            _mstSegment4Repository = mstSegment4Repository;
            _mstSegment3Repository = mstSegment3Repository;
            _mstSegment2Repository = mstSegment2Repository;
            _mstSegment1Repository = mstSegment1Repository;
            _mstSegment2ProjectTypeRepository = mstSegment2ProjectTypeRepository;
            _mstDepartmentRepository = mstDepartmentRepository;
            _mstSegment4GroupRepository = mstSegment4GroupRepository;
            _tempFileCacheManager = tempFileCacheManager;
            _bmsMstPeriodVersionRepository = bmsMstPeriodVersionRepository;
            _bmsMstVersionRepository = bmsMstVersionRepository;
        }

        public async Task<bool> CheckSaveAllImport(List<SegmentReadDataDto> listSegmentReadDataDto)
        {
            return listSegmentReadDataDto.Any(p => p.Remark != null);
        }

        public async Task<FileDto> ExportTemplate(int segNum)
        {
            try
            {
                string fileName = "CPS_Template_ImportSegment1.xlsx";
                if(segNum == 2)
                {
                    fileName = "CPS_Template_ImportSegment2.xlsx";
                }   
                else if(segNum == 3)
                {
                    fileName = "CPS_Template_ImportSegment3.xlsx";
                }
                else if (segNum == 4)
                {
                    fileName = "CPS_Template_ImportSegment4.xlsx";
                }
                else if (segNum == 5)
                {
                    fileName = "CPS_Template_ImportSegment5.xlsx";
                }
                else if (segNum == 12345)
                {
                    fileName = "CPS_Template_ImportBugetPlan.xlsx";
                }

                // Set License
                var file = new FileDto(fileName, MimeTypeNames.ApplicationVndOpenxmlformatsOfficedocumentSpreadsheetmlSheet);
                SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");

                // Path to File Template
                string template = "wwwroot/Excel_Template/BMS";
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

        public async Task<List<SegmentReadDataDto>> GetListSegmentFromExcel(byte[] fileBytes, string fileName, string segNum)
        {
            try
            {
                List<SegmentReadDataDto> rowList = new List<SegmentReadDataDto>();
                ISheet sheet;
                using (var stream = new MemoryStream(fileBytes))
                {
                    stream.Position = 0;
                    if (fileName.EndsWith("xlsx"))
                    {
                        XSSFWorkbook xssfwb = new XSSFWorkbook(stream); //This will read 2007 Excel format
                        sheet = xssfwb.GetSheetAt(0); //get first sheet from workbook 
                        rowList.AddRange(await ReadDataFromExcel(sheet, segNum));
                    }
                    else
                    {
                        HSSFWorkbook xssfwb = new HSSFWorkbook(stream); //This will read 2003 Excel fromat
                        sheet = xssfwb.GetSheetAt(0); //get first sheet from workbook 
                        rowList.AddRange( await ReadDataFromExcel(sheet, segNum));
                    }
                }
                return rowList;
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(00, "File tải lên không hợp lệ");
            }
        }


        private async Task<List<SegmentReadDataDto>> ReadDataFromExcel(ISheet sheet, string segNum)
        {
            SegmentReadDataDto importData = new SegmentReadDataDto();
            List<SegmentReadDataDto> rowList = new List<SegmentReadDataDto>();

            var countRow = 1;
            do
            {
                countRow++;
            } while (!(sheet.GetRow(countRow) == null || string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(countRow).GetCell(0)))));

            var index = 1;

            if(segNum == "1")
            {
                for (int g = 1; g < countRow - 1; g++)
                {
                    importData = new SegmentReadDataDto();

                    for (int h = 0; h < 6; h++)
                    {
                        switch (h)
                        {
                            case 1:
                                importData.PeriodName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.PeriodName == "")
                                {
                                    importData.Remark = "Period name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var period = await _mstPeriodRepository.FirstOrDefaultAsync(e => e.PeriodName.Equals(importData.PeriodName));
                                    if (period == null)
                                    {
                                        importData.Remark += "Period name does not exist, ";
                                    }
                                    else
                                    {
                                        importData.PeriodId = period.Id;
                                    }
                                }
                                break;
                            case 2:
                                importData.Code = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";

                                if (importData.Code == "")
                                {
                                    importData.Remark += "Code cannot be empty, ";
                                }
                                else
                                {
                                    //check duplicate in db
                                    var segment = _mstSegment1Repository.GetAll().Where(e => e.Code.Equals(importData.Code)).FirstOrDefault();
                                    if (segment != null)
                                    {
                                        importData.Remark += "Code already exists, ";
                                    }

                                    //check duolicate in list excel
                                    foreach (var item in rowList)
                                    {
                                        if (item.Code.Equals(importData.Code) )
                                        {
                                            importData.Remark += "Code cannot be duplicated in list import, ";
                                        }
                                    }
                                }
                                break;
                            case 3:
                                //importData.Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Int32.Parse((Convert.ToString(sheet.GetRow(g + 1).GetCell(h)))) : 0;
                                importData.Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.Name == "")
                                {
                                    importData.Remark += "Name cannot be empty, ";
                                }
                                break;
                            case 4:
                                importData.TypeCostName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.TypeCostName == "")
                                {
                                    importData.Remark += "Type cost name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var typeCode = _mstSegment1TypeCostRepository.GetAll().Where(e => e.TypeCostName.Equals(importData.TypeCostName)).FirstOrDefault();
                                    if (typeCode != null)
                                    {
                                        importData.TypeCostId = typeCode.Id;
                                    }
                                    else
                                    {
                                        importData.Remark += "Type code name does not exist, ";
                                    }
                                }
                                break;

                            case 5:
                                //importData.Status = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Int32.Parse((Convert.ToString(sheet.GetRow(g + 1).GetCell(h)))) : 1;
                                importData.Description = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                break;
                        }
                    }

                    rowList.Add(importData);
                    index++;
                }
            }
            //Segment 2
            else if (segNum == "2")
            {
                for (int g = 1; g < countRow - 1; g++)
                {
                    importData = new SegmentReadDataDto();

                    for (int h = 0; h < 6; h++)
                    {
                        switch (h)
                        {
                            case 1:
                                importData.PeriodName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.PeriodName == "")
                                {
                                    importData.Remark = "Period name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var period = _mstPeriodRepository.GetAll().Where(e => e.PeriodName.Equals(importData.PeriodName)).FirstOrDefault();
                                    if (period != null)
                                    {
                                        importData.PeriodId = period.Id;
                                    }
                                    else
                                    {
                                        importData.Remark += "Period name does not exist, ";
                                    }
                                }
                                break;
                            case 2:
                                importData.Code = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";

                                if (importData.Code == "")
                                {
                                    importData.Remark += "Code cannot be empty, ";
                                }
                                else
                                {
                                    //check duplicate in db
                                    var segment = _mstSegment2Repository.GetAll().Where(e => e.Code.Equals(importData.Code)).FirstOrDefault();
                                    if (segment != null)
                                    {
                                        importData.Remark += "Code already exists, ";
                                    }

                                    //check duolicate in list excel
                                    foreach (var item in rowList)
                                    {
                                        if (item.Code == importData.Code)
                                        {
                                            importData.Remark += "Code cannot be duplicated in list import, ";
                                        }
                                    }
                                }
                                break;
                            case 3:
                                importData.Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.Name == "")
                                {
                                    importData.Remark += "Name cannot be empty, ";
                                }
                                break;
                            case 4:
                                importData.ProjectTypeName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.ProjectTypeName == "")
                                {
                                    importData.Remark += "Project type name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var projectTpe = _mstSegment2ProjectTypeRepository.GetAll().Where(e => e.ProjectTypeName.Equals(importData.ProjectTypeName)).FirstOrDefault();
                                    if (projectTpe != null)
                                    {
                                        importData.ProjectTypeId = projectTpe.Id;
                                    }
                                    else
                                    {
                                        importData.Remark += "Type project name does not exist, ";
                                    }
                                }
                                break;

                            case 5:
                                importData.Description = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                break;
                        }
                    }

                    rowList.Add(importData);
                    index++;
                }
            }
            //Segment 3
            else if (segNum == "3")
            {
                for (int g = 1; g < countRow - 1; g++)
                {
                    importData = new SegmentReadDataDto();

                    for (int h = 0; h < 6; h++)
                    {
                        switch (h)
                        {
                            case 1:
                                importData.PeriodName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.PeriodName == "")
                                {
                                    importData.Remark = "Period name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var period = _mstPeriodRepository.GetAll().Where(e => e.PeriodName.Equals(importData.PeriodName)).FirstOrDefault();
                                    if (period != null)
                                    {
                                        importData.PeriodId = period.Id;
                                    }
                                    else
                                    {
                                        importData.Remark += "Period name does not exist, ";
                                    }
                                }
                                break;
                            case 2:
                                importData.Code = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";

                                if (importData.Code == "")
                                {
                                    importData.Remark += "Code cannot be empty, ";
                                }
                                else
                                {
                                    //check duplicate in db
                                    var segment = _mstSegment3Repository.GetAll().Where(e => e.Code.Equals(importData.Code)).FirstOrDefault();
                                    if (segment != null)
                                    {
                                        importData.Remark += "Code already exists, ";
                                    }

                                    //check duolicate in list excel
                                    foreach (var item in rowList)
                                    {
                                        if (item.Code == importData.Code)
                                        {
                                            importData.Remark += "Code cannot be duplicated in list import, ";
                                        }
                                    }
                                }
                                break;
                            case 3:
                                importData.Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.Name == "")
                                {
                                    importData.Remark += "Name cannot be empty, ";
                                }
                                break;
                            case 4:
                                importData.DepartmentName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.DepartmentName == "")
                                {
                                    importData.Remark += "Department name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var department = _mstDepartmentRepository.GetAll().Where(e => e.DepartmentName.Equals(importData.DepartmentName)).FirstOrDefault();
                                    if (department != null)
                                    {
                                        importData.DepartmentId = department.Id;
                                        importData.DivisionId = department.DivisionId;
                                    }
                                    else
                                    {
                                        importData.Remark += "Department name does not exist, ";
                                    }
                                }
                                break;

                            case 5:
                                importData.Description = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                break;
                        }
                    }

                    rowList.Add(importData);
                    index++;
                }
            }
            //Segment 4
            else if (segNum == "4")
            {
                for (int g = 1; g < countRow - 1; g++)
                {
                    importData = new SegmentReadDataDto();

                    for (int h = 0; h < 6; h++)
                    {
                        switch (h)
                        {
                            case 1:
                                importData.PeriodName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.PeriodName == "")
                                {
                                    importData.Remark = "Period name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var period = _mstPeriodRepository.GetAll().Where(e => e.PeriodName.Equals(importData.PeriodName)).FirstOrDefault();
                                    if (period != null)
                                    {
                                        importData.PeriodId = period.Id;
                                    }
                                    else
                                    {
                                        importData.Remark += "Period name does not exist, ";
                                    }
                                }
                                break;
                            case 2:
                                importData.Code = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";

                                if (importData.Code == "")
                                {
                                    importData.Remark += "Code cannot be empty, ";
                                }
                                else
                                {
                                    //check duplicate in db
                                    var segment = _mstSegment4Repository.GetAll().Where(e => e.Code.Equals(importData.Code)).FirstOrDefault();
                                    if (segment != null)
                                    {
                                        importData.Remark += "Code already exists, ";
                                    }

                                    //check duolicate in list excel
                                    foreach (var item in rowList)
                                    {
                                        if (item.Code == importData.Code)
                                        {
                                            importData.Remark += "Code cannot be duplicated in list import, ";
                                        }
                                    }
                                }
                                break;
                            case 3:
                                importData.Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.Name == "")
                                {
                                    importData.Remark += "Name cannot be empty, ";
                                }
                                break;
                            case 4:
                                importData.GroupSeg4Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.GroupSeg4Name == "")
                                {
                                    importData.Remark += "Group segment 4 name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var group = _mstSegment4GroupRepository.GetAll().Where(e => e.GroupName.Equals(importData.GroupSeg4Name)).FirstOrDefault();
                                    if (group != null)
                                    {
                                        importData.GroupSeg4Id = group.Id;
                                    }
                                    else
                                    {
                                        importData.Remark += "Group segment 4 name does not exist, ";
                                    }
                                }
                                break;

                            case 5:
                                importData.Description = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                break;
                        }
                    }

                    rowList.Add(importData);
                    index++;
                }
            }
            //Segment 5
            else if (segNum == "5")
            {
                for (int g = 1; g < countRow - 1; g++)
                {
                    importData = new SegmentReadDataDto();

                    for (int h = 0; h < 6; h++)
                    {
                        switch (h)
                        {
                            case 1:
                                importData.PeriodName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.PeriodName == "")
                                {
                                    importData.Remark = "Period name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var period = _mstPeriodRepository.GetAll().Where(e => e.PeriodName.Equals(importData.PeriodName)).FirstOrDefault();
                                    if (period != null)
                                    {
                                        importData.PeriodId = period.Id;
                                    }
                                    else
                                    {
                                        importData.Remark += "Period name does not exist, ";
                                    }
                                }
                                break;
                            case 2:
                                importData.Code = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";

                                if (importData.Code == "")
                                {
                                    importData.Remark += "Code cannot be empty, ";
                                }
                                else
                                {
                                    //check duplicate in db
                                    var segment = _mstSegment5Repository.GetAll().Where(e => e.Code.Equals(importData.Code)).FirstOrDefault();
                                    if (segment != null)
                                    {
                                        importData.Remark += "Code already exists, ";
                                    }

                                    //check duolicate in list excel
                                    foreach (var item in rowList)
                                    {
                                        if (item.Code == importData.Code)
                                        {
                                            importData.Remark += "Code cannot be duplicated in list import, ";
                                        }
                                    }
                                }
                                break;
                            case 3:
                                importData.Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.Name == "")
                                {
                                    importData.Remark += "Name cannot be empty, ";
                                }
                                break;

                            case 4:
                                importData.Description = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                break;

                            case 5:
                                importData.IsActive = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) == "1" ? true : false : true;
                                break;
                        }
                    }

                    rowList.Add(importData);
                    index++;
                }
            }
            //bud get plan
             else
            {
                for (int g = 1; g < countRow - 1; g++)
                {
                    importData = new SegmentReadDataDto();

                    for (int h = 0; h < 12; h++)
                    {
                        switch (h)
                        {
                            case 1:
                                importData.PeriodName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.PeriodName == "")
                                {
                                    importData.Remark = "Period name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var period = _mstPeriodRepository.GetAll().Where(e => e.PeriodName.Equals(importData.PeriodName)).FirstOrDefault();
                                    if (period != null)
                                    {
                                        importData.PeriodId = period.Id;
                                    }
                                    else
                                    {
                                        importData.Remark += "Period name does not exist, ";
                                    }
                                }
                                break;
                            case 2:
                                importData.PeriodVersionName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if(importData.PeriodId != null)
                                {
                                    if (importData.PeriodVersionName == "")
                                    {
                                        importData.Remark += "Period version cannot be empty, ";
                                    }
                                    else
                                    {

                                        //check invalid
                                        var versionEnum = from periodVersion in _bmsMstPeriodVersionRepository.GetAll().AsTracking()
                                                      join _vs in _bmsMstVersionRepository.GetAll().AsNoTracking()
                                                      on periodVersion.VersionId equals _vs.Id
                                                      where _vs.VersionName.Equals(importData.PeriodVersionName)
                                                      select new
                                                      {
                                                          PeriodVersionId = periodVersion.Id
                                                      };
                                        var version = versionEnum.FirstOrDefault();
                                        //var periodVersion = _bmsMstPeriodVersionRepository.GetAll().Where(e => e.VersionName.Equals(importData.PeriodVersionName) && e.PeriodId == importData.PeriodId).FirstOrDefault();
                                        if (version != null)
                                        {
                                            importData.PeriodVersion = version.PeriodVersionId;
                                        }
                                        else
                                        {
                                            importData.Remark += "Period version does not exist, ";
                                        }
                                    }
                                }
                                break;
                            case 3:
                                importData.type = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) == "1" ? 1 : 2 : 1;
                                break;

                            case 4:
                                importData.segment1Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.segment1Name == "")
                                {
                                    importData.Remark += "Seg1 name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var seg = _mstSegment1Repository.GetAll().Where(e => e.Name.Equals(importData.segment1Name)).FirstOrDefault();
                                    if (seg != null)
                                    {
                                        importData.Segment1Id = seg.Id;
                                        importData.segment1Code = seg.Code;
                                    }
                                    else
                                    {
                                        importData.Remark += "Seg1 name does not exist, ";
                                    }
                                }
                                break;

                            case 5:
                                importData.segment2Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.segment2Name == "")
                                {
                                    importData.Remark += "Seg2 name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var seg = _mstSegment2Repository.GetAll().Where(e => e.Name.Equals(importData.segment2Name)).FirstOrDefault();
                                    if (seg != null)
                                    {
                                        importData.Segment2Id = seg.Id;
                                        importData.segment2Code = seg.Code;
                                    }
                                    else
                                    {
                                        importData.Remark += "Seg2 name does not exist, ";
                                    }
                                }
                                break;

                            case 6:
                                importData.segment3Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.segment3Name == "")
                                {
                                    importData.Remark += "Seg3 name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var seg = _mstSegment3Repository.GetAll().Where(e => e.Name.Equals(importData.segment3Name)).FirstOrDefault();
                                    if (seg != null)
                                    {
                                        importData.Segment3Id = seg.Id;
                                        importData.segment3Code = seg.Code;
                                    }
                                    else
                                    {
                                        importData.Remark += "Seg3 name does not exist, ";
                                    }
                                }
                                break;

                            case 7:
                                importData.segment4Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.segment4Name == "")
                                {
                                    importData.Remark += "Seg4 name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var seg = _mstSegment4Repository.GetAll().Where(e => e.Name.Equals(importData.segment4Name)).FirstOrDefault();
                                    if (seg != null)
                                    {
                                        importData.Segment4Id = seg.Id;
                                        importData.segment4Code = seg.Code;
                                    }
                                    else
                                    {
                                        importData.Remark += "Seg4 name does not exist, ";
                                    }
                                }
                                break;

                            case 8:
                                importData.segment5Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.segment5Name == "")
                                {
                                    importData.Remark += "Seg5 name cannot be empty, ";
                                }
                                else
                                {
                                    //check invalid
                                    var seg = _mstSegment5Repository.GetAll().Where(e => e.Name.Equals(importData.segment5Name)).FirstOrDefault();
                                    if (seg != null)
                                    {
                                        importData.Segment5Id = seg.Id;
                                        importData.segment5Code = seg.Code;
                                    }
                                    else
                                    {
                                        importData.Remark += "Seg5 name does not exist, ";
                                    }
                                }
                                break;

                            case 9:
                                importData.Name = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                if (importData.Name == "")
                                {
                                    importData.Remark += "Activities name cannot be empty, ";
                                }
                                break;

                            case 10:
                                importData.Description = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                                break;

                            case 11:
                                importData.IsActive = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) == "1" ? true : false : true;
                                break;
                        }
                    }

                    rowList.Add(importData);
                    index++;
                }
            }

            return rowList;
        }
    }
}
