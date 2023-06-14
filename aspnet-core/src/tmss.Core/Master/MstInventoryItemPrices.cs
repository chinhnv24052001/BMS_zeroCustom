using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.Master
{
    [Table("MstInventoryItemPrices")]
    public partial class MstInventoryItemPrices : FullAuditedEntity<long>, IEntity<long>
    {
        public long InventoryItemId { get; set; }
        public long UnitOfMeasureId { get; set; }
        public long CurrencyId { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal UnitPrice { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal TaxPrice { get; set; }
    }
}
