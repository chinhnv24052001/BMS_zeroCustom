using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.Master
{
    [Table("ShoppingCartDetail")]
    public class ShoppingCartDetail : FullAuditedEntity<long>, IEntity<long>
    {
        [Column(TypeName = "decimal(18, 5)")]
        public decimal Qty { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? UnitPrice { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? TaxPrice { get; set; }
        public long? ShoppingCartId { get; set; }
        public long? InventoryItemId { get; set; }
        [StringLength(255)]
        public string ProductName { get; set; }
        public long? InventoryGroupId { get; set; }
        public long CurrencyId { get; set; }
        public string CurencyCode { get; set; }
        public DateTime DocumentDate { get; set; }
        public long SupplierId { get; set; }
        public Guid PicDepartmentId { get; set; }
        [StringLength(50)]
        public string Uom { get; set; }
        public DateTime DeliveryDate { get; set; }
        public long? BudgetCodeId { get; set; }
        public long? HeaderBudgetCodeId { get; set; }
        [StringLength(255)]
        public string UserRequestName { get; set; }
    }
}
