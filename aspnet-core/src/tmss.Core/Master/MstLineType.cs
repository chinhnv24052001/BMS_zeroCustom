using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstLineType : FullAuditedEntity<long>, IEntity<long>
    {
        public string LineTypeCode { get; set; }
        public string LineTypeName { get; set; }
    }
}
