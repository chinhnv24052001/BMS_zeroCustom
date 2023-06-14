using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.Master
{
    [Table("UserRequestDetail")]
    public partial class UserRequestDetail : FullAuditedEntity<long>, IEntity<long>
    {
        public long UserRequestId { get; set; }
        public long? ShoppingCartDetailId { get; set; }
        public long? InventoryItemId { get; set; }
        [StringLength(255)]
        public string ProductName { get; set; }
        public long? CategoryId { get; set; }
        public long? BudgetCodeId { get; set; }
        public long? LineTypeId { get; set; }
        [StringLength(500)]
        public string InventoryItemDescription { get; set; }
        [StringLength(50)]
        public string UnitMeasLookupCode { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? UnitPrice { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? ExchangeUnitPrice { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? TaxPrice { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal Quantity { get; set; }
        public DateTime? DeliveryDate { get; set; }
        public int? LineNum { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? CurrencyId { get; set; }
        public long? SupplierId { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? MonthN { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? MonthN1 { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? MonthN2 { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? MonthN3 { get; set; }
    }
}
