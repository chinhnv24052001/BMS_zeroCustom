using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PO
{
    public class PoLookupCodes : FullAuditedEntity<long>, IEntity<long>
    {
      public string LookupCode { get; set; }
      public string LookupType { get; set; }
      public string DisplayedField { get; set; }
      public string Description { get; set; }
      public bool IsActive { get; set; }
    }
}
