using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;

namespace tmss.Core.Master.Period
{
    public class MstPeriod : FullAuditedEntity<long>, IEntity<long>
    {
        public string PeriodName { get; set; }
        public bool IsActive { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime Todate { get; set; }
        public string Description { get; set; }
    }
}
