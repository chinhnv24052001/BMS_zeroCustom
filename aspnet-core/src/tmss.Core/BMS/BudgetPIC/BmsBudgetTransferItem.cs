using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.BudgetPIC
{
    public class BmsBudgetTransferItem : FullAuditedEntity<long>, IEntity<long>
    {
        public string Description { get; set; }
        public int Amount { get; set; }
        public string Remarks { get; set; }
        public long BudgetTransferId  { get; set; }
    }
}
