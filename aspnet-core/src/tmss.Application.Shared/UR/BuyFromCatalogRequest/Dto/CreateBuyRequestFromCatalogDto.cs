using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.UR.BuyFromCatalogRequest.Dto
{
    public class CreateBuyRequestFromCatalogDto : EntityDto<long>
    {
        public string ProductName { get; set; }
        public long SupplierId { get; set; }
        [StringLength(255)]
        public string SupplierName { get; set; }
        public long CurrencyId { get; set; }
        public DateTime? DocumentDate { get; set; }
        [StringLength(15)]
        public string CurrencyCode { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? ContractPriceAmount { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal Qty { get; set; }
        public long? InventoryItemId { get; set; }
        public long? InventoryGroupId { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? UnitPrice { get; set; }
        [Column(TypeName = "decimal(18,5)")]
        public decimal? TaxPrice { get; set; }
        public Guid PicDepartmentId { get; set; }
        public string Uom { get; set; }
        public DateTime DeliveryDate { get; set; }
        public long? BudgetCodeId { get; set; }
        public long? HeaderBudgetCodeId { get; set; }
        [StringLength(255)]
        public string UserRequestName { get; set; }
    }
}
