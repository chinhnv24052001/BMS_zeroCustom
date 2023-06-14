using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.Master
{
    [Table("MstCurrency")]
    public partial class MstCurrency : FullAuditedEntity<long>, IEntity<long>
    {
        [StringLength(15)]
        public string CurrencyCode { get; set; }
        [StringLength(80)]
        public string Name { get; set; }
        public int? EnabledFlag { get; set; }
        public DateTime? StartDateActive { get; set; }
        public DateTime? EndDateActive { get; set; }
        public string Status { get; set; }
        public string DescriptionEnglish { get; set; }
        public string DescriptionVetNamese { get; set; }

    }
}
