using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;

namespace tmss.Core.BMS.Master.Period
{
    public class BmsMstPeriod : FullAuditedEntity<long>, IEntity<long>
    {
        public string PeriodName { get; set; }
        public int PeriodYear { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime Todate { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }
}
