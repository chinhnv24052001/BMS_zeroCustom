using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.Master
{
    [Table("ShoppingCart")]
    public class ShoppingCart : FullAuditedEntity<long>, IEntity<long>
    {
        public bool Status { get; set; }
    }
}
