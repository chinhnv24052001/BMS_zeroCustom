using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryItems.Dto
{
    public class InventoryItemsSearchOutputDto
    {
        public long Id { get; set; }
        public long? OrganizationId { get; set; }
        public string OrganizationName { get; set; }
        public long? InventoryGroupId { get; set; }
        public string PartNo { get; set; }
        public string PartNoCPS { get; set; }
        public string PartCode { get; set; }
        public string Color { get; set; }
        public string PartName { get; set; }
        public string PartNameSupplier { get; set; }
        public decimal? UnitPrice { get; set; }
        public string CurrencyCode { get; set; }
        public long? CurrencyId { get; set; }
        public string SupplierName { get; set; }
        public long? SupplierId { get; set; }
        public decimal? TaxPrice { get; set; }
        public string ProductGroupName { get; set; }
        public string PrimaryUomCode { get; set; }
        public string PrimaryUnitOfMeasure { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public int TotalCount { get; set; }
        public string CostOfSalesAccount { get; set; }
        public string ExpenseAccount { get; set; }
        public string SalesAccount { get; set; }
        public long? IsActive { get; set; }
        public string ImageFileName { get; set; }
        public byte[] Base64Image { get; set; }
        public long? CountItem { get; set; }
        public string Source { get; set; }
        public long? Catalog { get; set; }

        public string Producer { get; set; }   // Nhà sx
        public string Origin { get; set; }   // Xuất sứ
        public string HowToPack { get; set; }   // Cách đóng gói
        public DateTime? AvailableTime { get; set; }   // Tgian có hàng
        public int? Priority { get; set; }   // Thứ tự ưu tiên
        public int? SafetyStockLevel { get; set; }   // Mức tồn kho an toàn
        public int? MinimumQuantity { get; set; }   // Số lượng đặt tối thiểu
        public string FactoryUse { get; set; }   // Xưởng sử dụng
        public string ConvertionUnitOfCode { get; set; }   // Đơn vị tính quy đổi của mã SP
        public string Material { get; set; }   // Chất liệu
        public int? Length { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
        public string UnitLength { get; set; }
        public string UnitWidth { get; set; }
        public string UnitHeight { get; set; }
        public int? Weight { get; set; }
        public string UnitWeight { get; set; }
    }
}
