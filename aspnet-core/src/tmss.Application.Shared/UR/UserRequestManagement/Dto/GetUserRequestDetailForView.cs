using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetUserRequestDetailForView : EntityDto<long>
    {
        public string UserRequestName { get; set; }
        [StringLength(50)]
        public string UserRequestNumber { get; set; }
        public Guid? PicDepartmentId { get; set; }
        public string RequestUser { get; set; }
        public long? CreatorUserId { get; set; }
        public DateTime? RequestDate { get; set; }
        [StringLength(200)]
        public string DepartmentName { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? SupplierId { get; set; }
        public long? CurrencyId { get; set; }
        public long? OriginalCurrencyId { get; set; }
        public long? ExpenseDepartmentId { get; set; }
        public long? DocumentTypeId { get; set; }
        public long? PurchasePurposeId { get; set; }
        public long? BudgetCodeId { get; set; }
        public string BudgetCode { get; set; }
        public string SupplierName { get; set; }
        public string InventoryGroupName { get; set; }
        public string CurrencyName { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? TotalPrice { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? OriginalTotalPrice { get; set; }
        [StringLength(200)]
        public string CheckBudgetStatus { get; set; }
        [StringLength(25)]
        public string ApprovalStatus { get; set; }
        public string Status { get; set; }
        [StringLength(500)]
        public string Note { get; set; }
        public DateTime DocumentDate { get; set; }
        public string RequestNote { get; set; }
        public string ReplyNote { get; set; }
        public List<GetAllProductsForViewDto> Products { get; set; }
        public List<GetAllUserRequestAttachmentsForViewDto> Attachments { get; set; }
    }
}
