using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.BMS.Master.UserControl
{
    public class BmsBudgetUserControl : FullAuditedEntity<long>, IEntity<long>
    {
        public long UserId { get; set; }    
        public long BudgetId { get; set; }    
        public int ManageType { get; set; }    
        public long PeriodId { get; set; }     
    }
}

