using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.Master
{
    [Table("MstHrOrgStructure")]
    public partial class MstHrOrgStructure : FullAuditedEntity<Guid>, IEntity<Guid>
    {
        [StringLength(50)]
        public string Code { get; set; }
        [StringLength(200)]
        public string Name { get; set; }
        [StringLength(100)]
        public string Description { get; set; }
        public int Published { get; set; }
        [StringLength(150)]
        public string OrgStructureTypeName { get; set; }
        [StringLength(50)]
        public string OrgStructureTypeCode { get; set; }
        public Guid? ParentId { get; set; }
    }
}
