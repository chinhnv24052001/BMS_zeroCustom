using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstContractTemplate : FullAuditedEntity<long>, IEntity<long>
    {
        public string TemplateCode { get; set; }
        public string TemplateName { get; set; }
        public long InventoryGroupId { get; set; }
        public string IsActive { get; set; }
        public string Description { get; set; }
    }
}
