using NPOI.SS.UserModel;
using NPOI.XSSF.UserModel;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.DataExporting.Excel.NPOI;
using tmss.ExcelDataReader.Dto;
using tmss.UR.UserRequestManagement;

namespace tmss.ExcelDataReader
{
    public class PcsUserRequestExcelDataReader : NpoiExcelImporterBase<UserRequestExcelDataDto>, IPcsUserRequestExcelDataReader
    {
        private readonly IUrUserRequestManagementAppService _userRequestManagement;

        public PcsUserRequestExcelDataReader(
            IUrUserRequestManagementAppService userRequestManagement)
        {
            _userRequestManagement = userRequestManagement;
        }
        public async Task<List<UserRequestExcelDataDto>> ReadDataFromExcel(byte[] files)
        {
            List<UserRequestExcelDataDto> rowList = new List<UserRequestExcelDataDto>();
            var data = new UserRequestExcelDataDto();
            DataTable dataTable = new DataTable();
            ISheet sheet;

            using (var stream = new MemoryStream(files))
            {
                stream.Position = 0;
                XSSFWorkbook xSSFWorkbook = new XSSFWorkbook(stream);
                sheet = xSSFWorkbook.GetSheetAt(0);

                for (int i = (sheet.FirstRowNum + 2); i <= sheet.LastRowNum; i++)
                {
                    data = new UserRequestExcelDataDto();
                    data.Deliveries = new List<UserRequestDeliveryDto>();

                    IRow deliveryRow = sheet.GetRow(1);

                    IRow row = sheet.GetRow(i);
                    if (row == null || string.IsNullOrWhiteSpace(row.ToString())) continue;
                    if (row.Cells.All(e => e.CellType == CellType.Blank)) continue;

                    if (row.GetCell(0) != null) data.ProductCodeColor = Convert.ToString(row.GetCell(0));
                    if (row.GetCell(1) != null) data.ProductName = Convert.ToString(row.GetCell(1));
                    if (row.GetCell(2) != null) data.Uom = Convert.ToString(row.GetCell(2));
                    if (row.GetCell(3) != null) data.OrganizationCode = Convert.ToString(row.GetCell(3));
                    if (row.GetCell(4) != null && row.GetCell(4).NumericCellValue != 0) data.UnitPrice = (decimal)row.GetCell(4).NumericCellValue;
                    if (row.GetCell(5) != null) data.VendorCode = Convert.ToString(row.GetCell(5));
                    if (row.GetCell(6) != null) data.VendorName = Convert.ToString(row.GetCell(6));

                    if (row.GetCell(37) != null) data.MonthN1 = Convert.ToString(row.GetCell(37));
                    if (row.GetCell(38) != null) data.MonthN2 = Convert.ToString(row.GetCell(38));
                    if (row.GetCell(39) != null) data.MonthN3 = Convert.ToString(row.GetCell(39));

                    for (int j = 7; j <= 36; j++)
                    {
                        string deliveryDate = "";
                        string quantity = "";

                        deliveryDate = (deliveryRow.GetCell(j).NumericCellValue != 0) ? DateTime.FromOADate(deliveryRow.GetCell(j).NumericCellValue).ToString("dd/MM/yyyy") : "";
                        quantity = (row.GetCell(j) != null) ? Convert.ToString(row.GetCell(j)) : "0";

                        UserRequestDeliveryDto delivery = new UserRequestDeliveryDto
                        {
                            DeliveryDate = deliveryDate,
                            Quantity = quantity == "" ? "0" : quantity
                        };

                        data.Deliveries.Add(delivery);
                    }

                    await _userRequestManagement.CheckValidateData(data);

                    rowList.Add(data);
                }
            }

            return rowList;
        }
    }
}
