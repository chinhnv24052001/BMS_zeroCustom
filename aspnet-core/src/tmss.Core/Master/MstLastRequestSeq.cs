using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations.Schema;
using tmss.GR.Enum;

namespace tmss.Master
{
    [Table("MstLastPurchasingSeq")]
    public partial class MstLastPurchasingSeq : FullAuditedEntity<long>, IEntity<long>
    {
        public int LastSeq { get; set; }
        public GenSeqType Type { get; set; }
        public DateTime LastRequestDate { get; set; }
    }
}
