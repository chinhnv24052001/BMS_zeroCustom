using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.BudgetPIC
{
    public class BmsMstTransferBudgetType : FullAuditedEntity<long>, IEntity<long>
    {
        public long TransferTypeId { get; set; }
        public string Name { get; set; }
        public string Note { get; set; }
    }
}
