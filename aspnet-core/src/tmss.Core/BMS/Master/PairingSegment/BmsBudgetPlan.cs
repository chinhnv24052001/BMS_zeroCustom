using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.PairingSegment
{
    public class BmsBudgetPlan : FullAuditedEntity<long>, IEntity<long>
    {
        public long Segment1Id { get; set; }
        public long Segment2Id { get; set; }
        public long Segment3Id { get; set; }
        public long Segment4Id { get; set; }
        public long Segment5Id { get; set; }
        public string BudgetCode { get; set; }
        public string ActivitiesName { get; set; }
        public string Description { get; set; } 
        public bool IsActive { get; set; }
        public long PeriodVersion { get; set; }
        public long PeriodId { get; set; }
        public double? AmountTransfer { get; set; }
        public long? TransferBudgetId { get; set; }
        public int? Type { get; set; }
    }
}
