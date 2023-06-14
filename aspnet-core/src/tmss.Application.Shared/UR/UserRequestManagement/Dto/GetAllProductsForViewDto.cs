using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetAllProductsForViewDto : EntityDto<long>
    {
        public long? InventoryItemId { get; set; }
        public long? InventoryGroupId { get; set; }
        public Guid? PicDepartmentId { get; set; }
        public long? BudgetCodeId { get; set; }
        public string BudgetCode { get; set; }
        [StringLength(40)]
        public string ProductCode { get; set; }
        public string Color { get; set; }
        public string ProductName { get; set; }
        public string Uom { get; set; }
        public long? CurrencyId { get; set; }
        public long? OriginalCurrencyId { get; set; }
        public string CurrencyCode { get; set; }
        public long? SupplierId { get; set; }
        public string SupplierName { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal UnitPrice { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal ExchangeUnitPrice { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal Quantity { get; set; }
        public DateTime? DeliveryDate { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal MonthN { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal MonthN1 { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal MonthN2 { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal MonthN3 { get; set; }
        public int? LineNum { get; set; }
        public int TotalCount { get; set; }
    }
}
