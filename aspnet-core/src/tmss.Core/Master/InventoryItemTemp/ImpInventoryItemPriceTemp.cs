using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master.InventoryItemTemp
{
    [Table("ImpInventoryItemPriceTemp")]
    public class ImpInventoryItemPriceTemp : FullAuditedEntity<long>, IEntity<long>
    {
        public string ItemsCode { get; set; }
        public string PartNameSupplier { get; set; }
        public string SupplierCode { get; set; }
        public decimal? TaxPrice { get; set; }
        public string UnitOfMeasure { get; set; }
        public decimal? UnitPrice { get; set; }
        public string CurrencyCode { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public long? CurrencyId { get; set; }
        public long? SupplierId { get; set; }
        public long? UnitOfMeasureId { get; set; }
        public long? InventoryItemId { get; set; }
        public long? CreatorUserId { get; set; }
        public string Remark { get; set; }
    }
}
