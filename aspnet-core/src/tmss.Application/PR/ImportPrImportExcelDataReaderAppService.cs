using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using tmss.DataExporting.Excel.NPOI;
using tmss.EntityFrameworkCore;
using tmss.PR.PurchasingRequest;
using tmss.PR.PurchasingRequest.Dto;

namespace tmss.PR
{
    public class ImportPrImportExcelDataReaderAppService : tmssAppServiceBase, IImportPrImportExcelDataReaderAppService
    {
        private readonly IRepository<PrImportPrTemp, long> _importPrRepo;
        private readonly IRepository<PrImportPrDetailTemp, long> _importPrDetailRepo;
        private readonly IDapperRepository<PrImportPrTemp, long> _spRepo;
        public ImportPrImportExcelDataReaderAppService(
            IRepository<PrImportPrTemp, long> importPrRepo,
            IDapperRepository<PrImportPrTemp, long> spRepo,
            IRepository<PrImportPrDetailTemp, long> importPrDetailRepo
            )
        {
            _importPrRepo = importPrRepo;
            _spRepo = spRepo;
            _importPrDetailRepo = importPrDetailRepo;
        }

        public async Task<List<ImportPrDto>> GetImportPrFromExcel(byte[] data)
        {
            try
            {
                await _spRepo.QueryAsync<ImportPrDto>("EXEC sp_PrDeleteBeforeImportPr @UserId", new
                {
                    @UserId = AbpSession.UserId
                });
                List<ImportPrDto> rowList = new List<ImportPrDto>();
                List<PrImportPrTemp> prImportPrTemps = new List<PrImportPrTemp>();
                ImportPrDto pr = new ImportPrDto();
                ImportPrDetailTempDto prDetail = new ImportPrDetailTempDto();
                DataTable dataTable = new DataTable();
                ISheet sheet;
                //PropertyInfo[] props = typeof(ImportPrDto).GetProperties();

                using (var stream = new MemoryStream(data))
                {
                    stream.Position = 0;
                    XSSFWorkbook xSSFWorkbook = new XSSFWorkbook(stream);
                    sheet = xSSFWorkbook.GetSheetAt(0);
                    IRow headerRow = sheet.GetRow(0);
                    int cellCount = headerRow.LastCellNum;

                    for (int i = (sheet.FirstRowNum + 3); i <= sheet.LastRowNum; i++)
                    {
                        pr = new ImportPrDto();
                        IRow row = sheet.GetRow(i);
                        if (row == null || string.IsNullOrWhiteSpace(row.ToString())) continue;
                        if (row.Cells.All(e => e.CellType == CellType.Blank)) continue;

                        try
                        {
                            for (int j = 0; j <= row.LastCellNum; j++)
                            {
                                if (i == 3)
                                {
                                    if (j == 10) prDetail.Delivery1 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 11) prDetail.Delivery2 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 12) prDetail.Delivery3 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 13) prDetail.Delivery4 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 14) prDetail.Delivery5 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 15) prDetail.Delivery6 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 16) prDetail.Delivery7 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 17) prDetail.Delivery8 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 18) prDetail.Delivery9 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 19) prDetail.Delivery10 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 20) prDetail.Delivery11 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 21) prDetail.Delivery12 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 22) prDetail.Delivery13 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 23) prDetail.Delivery14 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 24) prDetail.Delivery15 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 25) prDetail.Delivery16 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 26) prDetail.Delivery17 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 27) prDetail.Delivery18 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 28) prDetail.Delivery19 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 29) prDetail.Delivery20 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 30) prDetail.Delivery21 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 31) prDetail.Delivery22 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 32) prDetail.Delivery23 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 33) prDetail.Delivery24 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 34) prDetail.Delivery25 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 35) prDetail.Delivery26 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 36) prDetail.Delivery27 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 37) prDetail.Delivery28 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 38) prDetail.Delivery29 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                    if (j == 39) prDetail.Delivery30 = (row.GetCell(j) != null) ? DateTime.FromOADate(row.GetCell(j).NumericCellValue).ToString("yyyy-MM-dd") : null;

                                } else
                                {
                                    if (row.GetCell(j) == null || string.IsNullOrEmpty(row.GetCell(j).ToString())) continue;
                                    if (j == 0 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.ProductGroupName = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 1 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.ProductCode = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 2 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.ProductName = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 3 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Uom = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 4 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.OrganizationCode = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 5 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Location = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 6 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.UnitPrice = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 7 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.VendorName = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 8 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Comments = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 9 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.BudgetCode = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 10 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery1 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 11 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery2 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 12 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery3 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 13 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery4 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 14 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery5 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 15 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery6 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 16 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery7 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 17 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery8 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 18 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery9 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 19 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery10 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 20 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery11 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 21 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery12 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 22 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery13 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 23 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery14 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 24 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery15 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 25 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery16 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 26 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery17 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 27 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery18 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 28 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery19 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 29 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery20 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 30 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery21 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 31 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery22 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 32 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery23 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 33 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery24 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 34 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery25 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 35 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery26 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 36 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery27 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 37 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery28 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 38 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery29 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 39 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.Delivery30 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 40 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.MonthN1 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 41 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.MonthN2 = Convert.ToString(row.GetCell(j).ToString());
                                    if (j == 42 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.MonthN3 = Convert.ToString(row.GetCell(j).ToString());
                                    //if (j == 37 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) 
                                    //    pr.VendorName = Convert.ToString(row.GetCell(j).StringCellValue);
                                    //if (j == 38 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) pr.VendorSite = Convert.ToString(row.GetCell(j).ToString());
                                }

                            }
                        }
                        catch (Exception ex)
                        {
                            pr.Exception = ex.ToString();
                        }

                        if (i != 3)
                        {
                            PrImportPrTemp prImportPrTemp = ObjectMapper.Map<PrImportPrTemp>(pr);
                            prImportPrTemps.Add(prImportPrTemp);
                            rowList.Add(pr);
                        }
                    }
                }

                await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddRangeAsync(prImportPrTemps);
                await CurrentUnitOfWork.SaveChangesAsync();

                PrImportPrDetailTemp prImportPrDetailTemp  = ObjectMapper.Map<PrImportPrDetailTemp>(prDetail);
                await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(prImportPrDetailTemp);

                string _sql = "EXEC sp_PrValidateImportPr @UserId";
                var listPr = await _spRepo.QueryAsync<ImportPrDto>(_sql, new
                {
                    @UserId = AbpSession.UserId
                });
                return listPr.ToList();
            }
            catch (Exception ex)
            {
                return null;
            }
        }
    }
}
