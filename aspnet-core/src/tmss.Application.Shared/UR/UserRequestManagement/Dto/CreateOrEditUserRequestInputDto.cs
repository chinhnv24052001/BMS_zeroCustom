using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class CreateOrEditUserRequestInputDto : EntityDto<long>
    {
        public string UserRequestName { get; set; }
        public string UserRequestNumber { get; set; }
        public int? Type { get; set; }
        public long? ExpenseDepartmentId { get; set; }
        public long? DocumentTypeId { get; set; }
        public long? PurchasePurposeId { get; set; }
        public long? BudgetCodeId { get; set; }
        public DateTime RequestDate { get; set; }
        public Guid? PicDepartmentId { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? SupplierId { get; set; }
        public long? CurrencyId { get; set; }
        public long? OriginalCurrencyId { get; set; }
        public string OriginalCurrencyCode { get; set; }
        public long? DocumentId { get; set; }
        public string PurchaseOrganization { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? TotalPrice { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? OriginalTotalPrice { get; set; }
        public string Note { get; set; }
        public DateTime? DocumentDate { get; set; }
        public List<GetAllProductsForViewDto> Products { get; set; }
    }
}
