using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.ImportExcel.Product.Dto
{
    public class ProductImportDto
    {
        public string ProductGroupName { get; set; }
        public string Catalog { get; set; }
        public string ItemsCode { get; set; }
        public string Specification { get; set; }
        public string ApplicableProgram { get; set; }
        public string ItemsName { get; set; }   // Part Name
        public string Color { get; set; }   // Color
        public string PartNameSupplier { get; set; }
        public string SupplierName { get; set; }
        public string UnitOfMeasure { get; set; }   // Unit of Measure
        public string Producer { get; set; }   // Nhà sx
        public string Origin { get; set; }   // Xuất sứ
        public string HowToPack { get; set; }   // Cách đóng gói
        public string AvailableTime { get; set; }   // Tgian có hàng
        public int Priority { get; set; }   // Thứ tự ưu tiên
        public int SafetyStockLevel { get; set; }   // Mức tồn kho an toàn
        public int MinimumQuantity { get; set; }   // Số lượng đặt tối thiểu
        public string FactoryUse { get; set; }   // Xưởng sử dụng
        public string ConvertionUnitOfCode { get; set; }   // Đơn vị tính quy đổi của mã SP
        public string Material { get; set; }   // Chất liệu
        public int Length { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
        public string UnitLength { get; set; }
        public string UnitWidth { get; set; }
        public string UnitHeight { get; set; }
        public int Weight { get; set; }
        public string UnitWeight { get; set; }
        public long? InventoryItemId { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? CreatorUserId { get; set; }
        public string ProductImage { get; set; }
        public byte[] ByteFileImage { get; set; }
        public string Remark { get; set; }

        public string CurrencyCode { get; set; }   // Currency
    }
}
