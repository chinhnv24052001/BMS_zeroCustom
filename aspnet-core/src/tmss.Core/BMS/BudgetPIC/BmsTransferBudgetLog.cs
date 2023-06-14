using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.BudgetPIC
{
    public class BmsTransferBudgetLog : FullAuditedEntity<long>, IEntity<long>
    {
        public long BudgetTransferId { get; set; }
        public long UserId  { get; set; }
        public long StatusApproval { get; set; }
        public string ReasonReject { get; set; }

    }
}
