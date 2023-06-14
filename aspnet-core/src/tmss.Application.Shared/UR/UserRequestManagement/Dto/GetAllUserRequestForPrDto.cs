using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetAllUserRequestForPrDto : EntityDto<long>
    {
        public string RequisitionNo { get; set; }
        public string UserRequestName { get; set; }
        public string ProductGroupName { get; set; }
        public long? ItemId { get; set; }
        public long? PurchasePurposeId { get; set; }
        [StringLength(40)]
        public string PartNo { get; set; }
        public string PartName { get; set; }
        public long? CategoryId { get; set; }
        public string Category { get; set; }
        public string BudgetCode { get; set; }
        public string CategorySetname { get; set; }
        public string Uom{ get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal Quantity { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal UnitPrice { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal ExchangeUnitPrice { get; set; }
        public DateTime? NeedByDate { get; set; }
        public DateTime? DocumentDate { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal Amount { get; set; }
        public long? CurrencyId { get; set; }
        public string Currency { get; set; }
        public long? RequesterId { get; set; }
        public long? LineTypeId { get; set; }
        public long? InventoryGroupId { get; set; }
        public string RequesterName { get; set; }
        public long? VendorId { get; set; }
        public string VendorName { get; set; }
        [StringLength(255)]
        public string SuggestedVendorName { get; set; }
        public long? VendorSiteId { get; set; }
        public string SuggestedVendorLocation { get; set; }
        public long? BuyerId { get; set; }
        public string Buyer { get; set; }
        public int TotalCount { get; set; }
    }
}
