using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using tmss.ExcelDataReader.Dto;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class CreateUserRequestFromExcelInput
    {
        public long? InventoryGroupId { get; set; }
        public Guid? PicDepartmentId { get; set; }
        public long? ProductId { get; set; }
        public string ProductName { get; set; }
        public long? CurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public long? SupplierId { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? UnitPrice { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? TotalPrice { get; set; }
        public string Uom { get; set; }
        public string MonthN { get; set; }
        public string MonthN1 { get; set; }
        public string MonthN2 { get; set; }
        public string MonthN3 { get; set; }
        public List<UserRequestDeliveryDto> Deliveries { get; set; }
    }
}
