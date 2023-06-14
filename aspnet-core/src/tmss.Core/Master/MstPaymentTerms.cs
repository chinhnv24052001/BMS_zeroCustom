using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstPaymentTerms : FullAuditedEntity<long>, IEntity<long>
    {

        public string Name { get; set; }
        public bool EnableFlag {get; set; }
        public string Description {get; set; }
        public string Type {get; set; }

    }
}
