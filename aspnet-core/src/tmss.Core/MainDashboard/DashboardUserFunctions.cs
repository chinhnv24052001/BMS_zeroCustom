using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.MainDashboard
{
    [Table("DashboardUserFunctions")]
    public partial class DashboardUserFunctions : FullAuditedEntity<long>, IEntity<long>
    {
        public long UserId { get; set; }
        public long FunctionId { get; set; }
        public int Ordering { get; set; }
    }
}
