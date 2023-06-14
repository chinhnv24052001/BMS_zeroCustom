using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.MainDashboard
{
    [Table("DashboardFunctions")]
    public partial class DashboardFunctions : FullAuditedEntity<long>, IEntity<long>
    {
        [StringLength(255)]
        public string FunctionName { get; set; }
        [StringLength(255)]
        public string FunctionKey { get; set; }
    }
}
