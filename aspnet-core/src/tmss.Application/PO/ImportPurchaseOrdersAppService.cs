using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using NPOI.SS.Formula.Functions;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.EntityFrameworkCore;
using tmss.PO.PurchaseOrders;
using tmss.PO.PurchaseOrders.Dto;
using tmss.PR;
using tmss.PR.PurchasingRequest.Dto;

namespace tmss.PO
{
    public class ImportPurchaseOrdersAppService : tmssAppServiceBase, IImportPurchaseOrdersAppService
    {
        private readonly IDapperRepository<PoImportPurchaseOrderTemp, long> _spRepo;
        private readonly IRepository<PoImportPurchaseOrderTemp, long> _poImportPurchaseOrderTemp;

        public ImportPurchaseOrdersAppService(IDapperRepository<PoImportPurchaseOrderTemp, long> spRepo,
            IRepository<PoImportPurchaseOrderTemp, long> poImportPurchaseOrderTemp
            )
        {
            _spRepo = spRepo;
            _poImportPurchaseOrderTemp = poImportPurchaseOrderTemp;
        }

        public async Task<List<PoImportPurchaseOrderDto>> GetImportPoFromExcel(byte[] data)
        {
            try
            {
                List<PoImportPurchaseOrderDto> rowList = new List<PoImportPurchaseOrderDto>();
                PoImportPurchaseOrderDto po = new PoImportPurchaseOrderDto();
                ISheet sheet;
                await _spRepo.QueryAsync<ImportPrDto>("EXEC sp_PoDeleteBeforeImportPo @UserId", new
                {
                    @UserId = AbpSession.UserId
                });
                using (var stream = new MemoryStream(data))
                {
                    stream.Position = 0;
                    XSSFWorkbook xSSFWorkbook = new XSSFWorkbook(stream);
                    sheet = xSSFWorkbook.GetSheetAt(0);
                    IRow headerRow = sheet.GetRow(0);
                    int cellCount = headerRow.LastCellNum;

                    for (int i = (sheet.FirstRowNum + 3); i <= sheet.LastRowNum; i++)
                    {
                        po = new PoImportPurchaseOrderDto();
                        IRow row = sheet.GetRow(i);
                        if (row == null || string.IsNullOrWhiteSpace(row.ToString())) continue;
                        if (row.Cells.All(e => e.CellType == CellType.Blank)) continue;
                        //if ((row.GetCell(2) == null || string.IsNullOrEmpty(row.GetCell(2).ToString())) && i != 1) continue;
                        //IRow rowHeader = sheet.GetRow(2);
                        //if (!string.IsNullOrEmpty(rowHeader.GetCell(7).ToString())) po.PriceType = Convert.ToString(rowHeader.GetCell(7).ToString());
                      

                        //po.GlDate = (rowHeader.GetCell(12) != null && !string.IsNullOrEmpty(rowHeader.GetCell(12).ToString().Trim())) ? DateTime.Parse(rowHeader.GetCell(12).StringCellValue).ToString("yyyy-MM-dd") : null;
                        
                        //if (!string.IsNullOrEmpty(rowHeader.GetCell(14).ToString())) po.DestinationType = Convert.ToString(rowHeader.GetCell(14).ToString());
                        //if (!string.IsNullOrEmpty(rowHeader.GetCell(16).ToString())) po.Location = Convert.ToString(rowHeader.GetCell(16).ToString());
                        //if (!string.IsNullOrEmpty(rowHeader.GetCell(17).ToString())) po.Subinventory = Convert.ToString(rowHeader.GetCell(17).ToString());

                        try
                        {
                            for (int j = 0; j <= row.LastCellNum; j++)
                            {

                                if (row.GetCell(j) == null) continue;
                                if (j == 0 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.ProductGroupName = Convert.ToString(row.GetCell(j).ToString());
                                if (j == 1 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.VendorName = Convert.ToString(row.GetCell(j).ToString());
                                if (j == 2 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.Comments = Convert.ToString(row.GetCell(j).ToString());
                                if (j == 3 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.VendorSiteName = Convert.ToString(row.GetCell(j).ToString());
                                if (j == 4 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.ProductCode = Convert.ToString(row.GetCell(j).ToString());
                                if (j == 5 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.ProductName = Convert.ToString(row.GetCell(j).ToString());
                                if (j == 6 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.Uom = Convert.ToString(row.GetCell(j).ToString());
                                if (j == 7 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.Quantity = Convert.ToString(row.GetCell(j).ToString());
                                if (j == 8 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.UnitPrice = Convert.ToString(row.GetCell(j).ToString());
                                if (j == 9 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.BudgetCode = Convert.ToString(row.GetCell(j).ToString());
                                //if (j == 8 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.Contract = Convert.ToString(row.GetCell(j).ToString());
                                po.NeedByPaintSteel = (row.GetCell(10) != null) ? DateTime.FromOADate(row.GetCell(10).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                po.GlDate = (row.GetCell(11) != null && row.GetCell(11).ToString() != "") ? DateTime.FromOADate(row.GetCell(11).NumericCellValue).ToString("yyyy-MM-dd") : null;
                                //if (j == 12 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.Requisition = Convert.ToString(row.GetCell(j).ToString());
                                if (j == 12 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.Organization = Convert.ToString(row.GetCell(j).ToString());
                                //if (j == 11 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.DestinationType = Convert.ToString(row.GetCell(j).ToString());
                                if (j == 13 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.Location = Convert.ToString(row.GetCell(j).ToString());
                                //if (j == 14 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.Subinventory = Convert.ToString(row.GetCell(j).ToString());
                                //if (j == 16 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.Requester = Convert.ToString(row.GetCell(j).ToString());
                                //if (j == 19 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.MinimumReleaseAmount = Convert.ToString(row.GetCell(j).ToString());
                                //if (j == 20 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.TransactionNature = Convert.ToString(row.GetCell(j).ToString());
                                //if (j == 21 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.Promised = Convert.ToString(row.GetCell(j).ToString());
                                //if (j == 22 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.RequisitionLine = Convert.ToString(row.GetCell(j).ToString());
                                //if (j == 23 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.ChargeAccount = Convert.ToString(row.GetCell(j).ToString());
                                //if (j == 24 && !string.IsNullOrEmpty(row.GetCell(j).ToString())) po.ShipTo = Convert.ToString(row.GetCell(j).ToString());


                            }
                        }
                        catch (Exception ex)
                        {
                            po.Exception = ex.ToString();
                        }

                        PoImportPurchaseOrderTemp poImportPurchaseOrderTemp = ObjectMapper.Map<PoImportPurchaseOrderTemp>(po);
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(poImportPurchaseOrderTemp);
                        await CurrentUnitOfWork.SaveChangesAsync();
                        rowList.Add(po);
                    }
                }

                string _sql = "EXEC sp_PoValidateImportPo @UserId";
                var listPr = await _spRepo.QueryAsync<PoImportPurchaseOrderDto>(_sql, new
                {
                    @UserId = AbpSession.UserId
                });
                return listPr.ToList();
            }
            catch (Exception)
            {
                return null;
            }
        }
    }
}
