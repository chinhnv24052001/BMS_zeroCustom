using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstPurchasePurpose : FullAuditedEntity<long>, IEntity<long>
    {
        public string PurchasePurposeName { get; set; }
        public string PurchasePurposeCode { get; set; }
        public bool? HaveBudgetCode { get; set; }
        public int Status { get; set; }
    }
}
