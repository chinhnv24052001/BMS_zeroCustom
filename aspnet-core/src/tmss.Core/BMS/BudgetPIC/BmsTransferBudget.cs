using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.BudgetPIC
{
    public class BmsTransferBudget : FullAuditedEntity<long>, IEntity<long>
    {
        public DateTime? Date { get; set; }
        public string TransferNo { get; set; }
        public long FromDepId { get; set; }
        public string FromPICName { get; set; }
        public string FromPICNoEmail { get; set; }
        public long FromBudgetId { get; set; }
        public int FromRemaining { get; set; }
        public long ToDepId { get; set; }
        public string ToPICName { get; set; }
        public long ToPICUserId { get; set; }
        public string ToPICNoEmail { get; set; }
        public long ToBudgetId { get; set; }
        public int ToRemaining { get; set; }
        public int AmountTransfer { get; set; }
        public string Purpose { get; set; }
        public long Status { get; set; }
        public long Type { get; set; }
    }
}
