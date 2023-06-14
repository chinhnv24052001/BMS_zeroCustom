using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstLocations : FullAuditedEntity<long>, IEntity<long>
    {
        public string Language { get; set; }
        public string SourceLanguage { get; set; }
        public string LocationCode { get; set; }
        public string Description { get; set; }
    }
}
