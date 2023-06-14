using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.Master
{
    [Table("UserRequest")]
    public partial class UserRequest : FullAuditedEntity<long>, IEntity<long>
    {
        [StringLength(50)]
        public string UserRequestNumber { get; set; }
        [StringLength(255)]
        public string UserRequestName { get; set; }
        public long? ShoppingCartId { get; set; }
        public long? PicUserId { get; set; }
        public Guid? PicDepartmentId { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? CurrencyId { get; set; }
        public long? OriginalCurrencyId { get; set; }
        public long? SupplierId { get; set; }
        public long? PurchasePurposeId { get; set; }
        public long? ExpenseDepartmentId { get; set; }
        public long? DocumentId { get; set; }
        public long? BudgetCodeId { get; set; }
        [StringLength(200)]
        public string DepartmentApprovalName { get; set; }
        [StringLength(255)]
        public string PurchaseOrganization { get; set; }
        [StringLength(25)]
        public string ApprovalStatus { get; set; }
        [StringLength(25)]
        public string CheckBudgetStatus { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? TotalPrice { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? OriginalTotalPrice { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? TotalPriceUsd { get; set; }
        [StringLength(500)]
        public string Note { get; set; }
        public DateTime DocumentDate { get; set; }
    }
}
