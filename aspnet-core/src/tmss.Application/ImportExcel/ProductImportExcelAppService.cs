using Abp.UI;
using NPOI.HSSF.UserModel;
using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Office.Interop.Excel;
using Microsoft.AspNetCore.Hosting;
using tmss.ImportExcel.Product;
using tmss.ImportExcel.Product.Dto;
using NPOI.HPSF;

namespace tmss.ImportExcel
{
    public class ProductImportExcelAppService : tmssAppServiceBase, IProductImportExcelAppService
    {
        private IWebHostEnvironment _env;
        public ProductImportExcelAppService(IWebHostEnvironment env)
        {
            _env = env;
        }

        public async Task<List<ProductImportDto>> GetListProductFromExcel(byte[] fileBytes, string fileName)
        {
            try
            {
                List<ProductImportDto> rowList = new List<ProductImportDto>();
                ISheet sheet;
                using (var stream = new MemoryStream(fileBytes))
                {
                    stream.Position = 0;
                    if (fileName.EndsWith("xlsx"))
                    {
                        XSSFWorkbook xssfwb = new XSSFWorkbook(stream); //This will read 2007 Excel format
                        sheet = xssfwb.GetSheetAt(0); //get first sheet from workbook 
                        rowList.AddRange(ReadDataFromExcel(sheet, xssfwb.GetSheetName(0), fileName, (List<XSSFPictureData>)xssfwb.GetAllPictures()));
                    }
                    else
                    {
                        HSSFWorkbook xssfwb = new HSSFWorkbook(stream); //This will read 2003 Excel fromat
                        sheet = xssfwb.GetSheetAt(0); //get first sheet from workbook 
                        rowList.AddRange(ReadDataFromExcel(sheet, xssfwb.GetSheetName(0), fileName, (List<XSSFPictureData>)xssfwb.GetAllPictures()));
                    }
                }
                return rowList;
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(00, "File tải lên không hợp lệ");
            }
        }

        private List<ProductImportDto> ReadDataFromExcel(ISheet sheet, string sheetName, string fileName, List<XSSFPictureData> allPics)
        {
            ProductImportDto importData = new ProductImportDto();
            List<ProductImportDto> rowList = new List<ProductImportDto>();

            var countRow = 1;
            do
            {
                countRow++;
            } while (!(sheet.GetRow(countRow) == null || string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(countRow).GetCell(0)))));

            var index = 1;
            for (int g = 0; g < countRow - 3; g++)
            {
                importData = new ProductImportDto();

                for (int h = 0; h < 29; h++)
                {
                    switch (h)
                    {
                        case 0:
                            importData.ProductGroupName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 1:
                            importData.Catalog = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 2:
                            importData.ItemsCode = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 3:
                            importData.Color = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 4:
                            importData.ItemsName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 5:
                            importData.Specification = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 6:
                            importData.ApplicableProgram = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 7:
                            importData.PartNameSupplier = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 8:
                            importData.SupplierName = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 9:
                            importData.UnitOfMeasure = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 10:
                            importData.ConvertionUnitOfCode = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 11:
                            importData.Producer = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 12:
                            importData.Material = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 13:
                            importData.Origin = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 14:
                            //int idx = getIndexImageFromExcel(fileName, (g + 2));
                            ////importData.ProductImage = idx > 0 ? Convert.ToBase64String(allPics[idx - 1].Data) : "";
                            //importData.ByteFileImage = allPics[idx - 1].Data;
                            //importData.ProductImage = GetFileName(importData.ByteFileImage, importData.ItemsCode, index);

                            //importData.ProductImage = null;
                            break;
                        case 15:
                            importData.HowToPack = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 16:
                            importData.AvailableTime = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 17:
                            importData.Priority = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Int32.Parse(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) : 0;
                            break;
                        case 18:
                            importData.SafetyStockLevel = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Int32.Parse(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) : 0;
                            break;
                        case 19:
                            importData.MinimumQuantity = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Int32.Parse(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) : 0;
                            break;
                        case 20:
                            importData.FactoryUse = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;

                        case 21:
                            importData.Length = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Int32.Parse(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) : 0;
                            break;
                        case 22:
                            importData.UnitLength = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 23:
                            importData.Width = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Int32.Parse(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) : 0;
                            break;
                        case 24:
                            importData.UnitWidth = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 25:
                            importData.Height = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Int32.Parse(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) : 0;
                            break;
                        case 26:
                            importData.UnitHeight = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                        case 27:
                            importData.Weight = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Int32.Parse(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) : 0;
                            break;
                        case 28:
                            importData.UnitWeight = !string.IsNullOrWhiteSpace(Convert.ToString(sheet.GetRow(g + 3).GetCell(h))) ? Convert.ToString(sheet.GetRow(g + 3).GetCell(h)) : "";
                            break;
                    }
                }
                rowList.Add(importData);
                index++;
            }
            return rowList;
        }

        //Get index Image
        private int getIndexImageFromExcel(string fileName, int row)
        {
            System.Globalization.CultureInfo oldCI = System.Threading.Thread.CurrentThread.CurrentCulture;
            System.Threading.Thread.CurrentThread.CurrentCulture = new System.Globalization.CultureInfo("en-US");
            int indexImg = 0;
            var folderName = Path.Combine("wwwroot", "TempFile");
            var pathToSave = Path.Combine(_env.ContentRootPath, folderName);
            var fullPath = Path.Combine(pathToSave, fileName);
            var excelApp = new Application();
            excelApp.Workbooks.Add();

            Workbook workbook = excelApp.Workbooks.Open(fullPath, Type.Missing, Type.Missing,
                              Type.Missing, Type.Missing, Type.Missing, Type.Missing,
                              Type.Missing, Type.Missing, Type.Missing, Type.Missing,
                              Type.Missing, Type.Missing, Type.Missing, Type.Missing);

            System.Threading.Thread.CurrentThread.CurrentCulture = oldCI;

            Worksheet worksheet = workbook.Worksheets["Sheet1"];

            foreach (var pic in worksheet.Pictures())
            {
                int startCol = pic.TopLeftCell.Column;
                int startRow = pic.TopLeftCell.Row;
                int endCol = pic.BottomRightCell.Column;
                int endRow = pic.BottomRightCell.Row;
                double leftPic = pic.Left;
                double topPic = pic.Top;
                double heightPic = pic.Height;
                double bottomPic = pic.Height + pic.Top;
                var cell = worksheet.Cells[row, 9];
                double leftCell = cell.Left;
                double topCell = cell.Top;
                double heightCell = cell.Height;
                double bottomCell = cell.Height + cell.Top;
                if (startRow == row && endRow == row)
                {
                    indexImg = pic.Index;
                }
                else if (startRow < row && endRow == row)
                {
                    double differenceTop = topCell - topPic;
                    if (heightPic - differenceTop > differenceTop)
                    {
                        indexImg = pic.Index;
                    }
                    else
                    {

                    }
                }
                else if (startRow == row && endRow > row)
                {
                    double differenceBottom = bottomPic - bottomCell;
                    if (heightPic - differenceBottom > differenceBottom)
                    {
                        indexImg = pic.Index;
                    }
                    else
                    {

                    }
                }
                else if ((startRow + 1) == row && (endRow - 1 == row))
                {
                    double differenceTop = topCell - topPic;
                    double differenceBottom = bottomPic - bottomCell;
                    if (heightPic - differenceBottom > differenceTop && heightPic - differenceBottom > differenceBottom)
                    {
                        indexImg = pic.Index;
                    }
                    else
                    {

                    }
                }
            }
            return indexImg;
        }

        //GetFileName
        public string GetFileName(byte[] byteFile, string productName, int index)
        {
            string fileName = "";
            if (byteFile != null)
            {
                  fileName = Path.GetFileNameWithoutExtension(productName) + DateTime.Now.Millisecond.ToString() + "_" + index.ToString() + ".png";
            }
            return fileName;
        }

       
    }
}
