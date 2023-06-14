using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstInventoryCodeConfig : FullAuditedEntity<long>, IEntity<long>
    {
        [StringLength(50)]
        public string InventoryGroupCode { get; set; }
        [StringLength(240)]
        public string InventoryGroupName { get; set; }
        public string CodeHeader { get; set; }
        public string StartNum { get; set; }
        public string EndNum { get; set; }
        public string CurrentNum { get; set; }
        public string Status { get; set; }
        public string DocCode { get; set; }
    }
}
