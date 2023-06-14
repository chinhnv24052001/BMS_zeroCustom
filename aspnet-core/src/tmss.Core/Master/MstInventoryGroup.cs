using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;

namespace tmss.Master
{
    public partial class MstInventoryGroup : FullAuditedEntity<long>, IEntity<long>
    {
        [StringLength(50)]
        public string ProductGroupName { get; set; }
        [StringLength(50)]
        public string ProductGroupCode { get; set; }
        public Guid? PicDepartmentId { get; set; }
        public Guid? PurchaDepartmentId { get; set; }
        public Guid? DeliDepartmentId { get; set; }
        public long? ProductGroupId { get; set; }
        public bool? IsCatalog { get; set; }
        public string Description { get; set; }
        public bool? IsInventory { get; set; }
        public bool? UR { get; set; }
        public bool? PR { get; set; }
        public bool? PO { get; set; }
        public string Status { get; set; }
        [StringLength(255)]
        public string BudgetCode { get; set; }
        [StringLength(240)]
        public string OrganizationName { get; set; }
        [StringLength(60)]
        public string Location { get; set; }
        [StringLength(500)]
        public string PurchasePurpose { get; set; }
    }
}
