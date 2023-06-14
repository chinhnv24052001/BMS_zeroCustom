using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Price
{
    public class MstAttachFiles : FullAuditedEntity<long>, IEntity<long>
    {
        public long HeaderId { get; set; }
        public string OriginalFileName { get; set; }
        public string ServerFileName { get; set; }
        public string RootPath { get; set; }
        public string AttachFileType { get; set; }
    }
}
