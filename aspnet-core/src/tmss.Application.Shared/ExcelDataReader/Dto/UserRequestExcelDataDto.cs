using System;
using System.Collections.Generic;

namespace tmss.ExcelDataReader.Dto
{
    public class UserRequestExcelDataDto
    {
        public long? InventoryGroupId { get; set; }
        public Guid? PicDepartmentId { get; set; }
        public string ProductGroupName { get; set; }
        public long? ProductId { get; set; }
        public string ProductCodeColor { get; set; }
        public string ProductCode { get; set; }
        public string ColorCode { get; set; }
        public string ProductName { get; set; }
        public string Uom { get; set; }
        public long UomId { get; set; }
        public string OrganizationCode { get; set; }
        public decimal UnitPrice { get; set; }
        public long? CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public long? SupplierId { get; set; }
        public string VendorCode { get; set; }
        public string VendorName { get; set; }
        public List<UserRequestDeliveryDto> Deliveries { get; set; }
        public string MonthN1 { get; set; }
        public string MonthN2 { get; set; }
        public string MonthN3 { get; set; }
        public string Exception { get; set; }
        public decimal SumQty { get; set; }
        public bool CanBeImported()
        {
            return string.IsNullOrEmpty(Exception);
        }
    }
}
