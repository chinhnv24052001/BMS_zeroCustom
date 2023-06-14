using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using Castle.MicroKernel.SubSystems.Conversion;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Price
{
    [Table("PrcContractLines")]
    public class PrcContractLines : FullAuditedEntity<long>, IEntity<long>
    {
        public long PrcContractHeaderId { get; set; }
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
