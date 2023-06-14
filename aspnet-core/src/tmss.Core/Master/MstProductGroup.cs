using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstProductGroup : FullAuditedEntity<long>, IEntity<long>
    {
        public long Id { get; set; }
        public string ProductGroupCode { get; set; }
        public string ProductGroupName { get; set; }
        public long? ParentId { get; set; }
        public string Status { get; set; }
    }
}
