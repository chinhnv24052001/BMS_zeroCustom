using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.Master
{
    [Table("MstInventoryItems")]
    public partial class MstInventoryItems : FullAuditedEntity<long>, IEntity<long>
    {
        public long? InventoryItemId { get; set; }
        public long? InventoryGroupId { set; get; }
        public long? OrganizationId { get; set; }
        public long? CurrencyId { get; set; }
        public long? SupplierId { get; set; }
        [StringLength(50)]
        public string PrimaryUomCode { get; set; }
        [StringLength(50)]
        public string PrimaryUnitOfMeasure { get; set; }
        [StringLength(30)]
        public string ItemType { get; set; }
        public int? IsActive { get; set; }
        public int InventoryItemFlag { get; set; }
        [StringLength(255)]
        public string CostOfSalesAccount { get; set; }
        [StringLength(255)]
        public string ExpenseAccount { get; set; }
        [StringLength(255)]
        public string SalesAccount { get; set; }
        [StringLength(40)]
        public string PartNo { get; set; }
        [StringLength(40)]
        public string Color { get; set; }
        [StringLength(500)]
        public string PartName { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? ListPrice { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? UnitPrice { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? TaxPrice { get; set; }
        [StringLength(255)]
        public string ImageFileName { get; set; }
        public string Source { get; set; }
        [StringLength(240)]
        public string PartNameSupplier { get; set; }
        [StringLength(500)]
        public string Producer { get; set; }   // Nhà sx
        [StringLength(500)]
        public string Origin { get; set; }   // Xuất sứ
        [StringLength(200)]
        public string HowToPack { get; set; }   // Cách đóng gói
        public DateTime? AvailableTime { get; set; }   // Tgian có hàng
        public int? Priority { get; set; }   // Thứ tự ưu tiên
        public int? SafetyStockLevel { get; set; }   // Mức tồn kho an toàn
        public int? MinimumQuantity { get; set; }   // Số lượng đặt tối thiểu
        [StringLength(250)]
        public string FactoryUse { get; set; }   // Xưởng sử dụng
        [StringLength(200)]
        public string ConvertionUnitOfCode { get; set; }   // Đơn vị tính quy đổi của mã SP
        [StringLength(200)]
        public string Material { get; set; }   // Chất liệu
        public int? Length { get; set; }
        public int? Width { get; set; }
        public int? Height { get; set; }
        [StringLength(100)]
        public string UnitLength { get; set; }
        [StringLength(100)]
        public string UnitWidth { get; set; }
        [StringLength(100)]
        public string UnitHeight { get; set; }
        public int? Weight { get; set; }
        [StringLength(100)]
        public string UnitWeight { get; set; }
        public long? Catalog { get; set; }
        [StringLength(500)]
        public string Specification { get; set; }
        [StringLength(500)]
        public string ApplicableProgram { get; set; }
        [StringLength(40)]
        public string PartNoCPS { get; set; }
    }
}
