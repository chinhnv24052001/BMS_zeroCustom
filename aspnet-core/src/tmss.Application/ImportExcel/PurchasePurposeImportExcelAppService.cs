using Abp.UI;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Office.Interop.Excel;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.ImportExcel.Product.Dto;
using tmss.ImportExcel.Product;
using tmss;
using tmss.ImportExcel.PurchasePurpose;
using tmss.ImportExcel.PurchasePurpose.Dto;
using Microsoft.AspNetCore.Mvc;
using tmss.Master.PurchasePurpose.Dto;
using Abp.Domain.Repositories;
using tmss.Master;

namespace tmss.ImportExcel
{
    public class PurchasePurposeImportExcelAppService : tmssAppServiceBase, IPurchasePurposeImportExcelAppService
    {
        private IWebHostEnvironment _env;
        private readonly IRepository<MstPurchasePurpose, long> _mstPurchasePurposeRepository;
        public PurchasePurposeImportExcelAppService(IWebHostEnvironment env,
            IRepository<MstPurchasePurpose, long> mstPurchasePurposeRepository)
        {
            _env = env;
            _mstPurchasePurposeRepository = mstPurchasePurposeRepository;
        }

        public async Task<List<PurchasePurposeImportDto>> GetListPurchasePurposeFromExcel(byte[] fileBytes, string fileName)
        {
            try
            {
                List<PurchasePurposeImportDto> rowList = new List<PurchasePurposeImportDto>();
                ISheet sheet;
                using (var stream = new MemoryStream(fileBytes))
                {
                    stream.Position = 0;
                    if (fileName.EndsWith("xlsx"))
                    {
                        XSSFWorkbook xssfwb = new XSSFWorkbook(stream); //This will read 2007 Excel format
                        sheet = xssfwb.GetSheetAt(0); //get first sheet from workbook 
                        rowList.AddRange(ReadDataFromExcel(sheet));
                    }
                    else
                    {
                        HSSFWorkbook xssfwb = new HSSFWorkbook(stream); //This will read 2003 Excel fromat
                        sheet = xssfwb.GetSheetAt(0); //get first sheet from workbook 
                        rowList.AddRange(ReadDataFromExcel(sheet));
                    }
                }
                return rowList;
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(00, "File tải lên không hợp lệ");
            }
        }

        private List<PurchasePurposeImportDto> ReadDataFromExcel(ISheet sheet)
        {
            PurchasePurposeImportDto importData = new PurchasePurposeImportDto();
            List<PurchasePurposeImportDto> rowList = new List<PurchasePurposeImportDto>();

            var countRow = 1;
            do
            {
                countRow++;
            } while (!(sheet.GetRow(countRow) == null || string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(countRow).GetCell(0)))));

            var index = 1;
            for (int g = 0; g < countRow - 1; g++)
            {
                importData = new PurchasePurposeImportDto();

                for (int h = 0; h < 5; h++)
                {
                    switch (h)
                    {
                        case 1:
                            importData.PurchasePurposeName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                            if (importData.PurchasePurposeName == "")
                            {
                                importData.Remark = "Purchase purpose name cannot be empty, ";
                            }
                            break;
                        case 2:
                            importData.PurchasePurposeCode = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 1).GetCell(h)) : "";
                            
                            if(importData.PurchasePurposeCode == "")
                            {
                                importData.Remark += "Purchase purpose code cannot be empty, ";
                            }
                            else
                            {
                                //check duplicate in db
                                var purchasePurpose = _mstPurchasePurposeRepository.GetAll().Where(e => e.PurchasePurposeCode.Equals(importData.PurchasePurposeCode)).FirstOrDefault();
                                if (purchasePurpose != null)
                                {
                                    importData.Remark += "Purchase purpose code already exists, ";
                                }

                                //check duolicate in list excel
                                foreach(var item in rowList)
                                {
                                    if (item.PurchasePurposeCode == importData.PurchasePurposeCode)
                                    {
                                        importData.Remark += "Purchase purpose code cannot be duplicated, ";
                                    }
                                }
                            }    

                            break;
                        case 3:
                            importData.HaveBudgetCode = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Int32.Parse((Convert.ToString(sheet.GetRow(g + 1).GetCell(h)))) : 0;
                            break;
                        case 4:
                            importData.Status = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 1).GetCell(h))) ? Int32.Parse((Convert.ToString(sheet.GetRow(g + 1).GetCell(h)))) : 1;
                            break;
                    }
                }

                rowList.Add(importData);
                index++;
            }
            return rowList;
        }

    }
}
