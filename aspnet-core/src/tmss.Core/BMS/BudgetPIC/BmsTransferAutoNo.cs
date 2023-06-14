using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.BudgetPIC
{
    public class BmsTransferAutoNo : FullAuditedEntity<long>, IEntity<long>
    {
        public int TransferNoAuto { get; set; }
    }
}
