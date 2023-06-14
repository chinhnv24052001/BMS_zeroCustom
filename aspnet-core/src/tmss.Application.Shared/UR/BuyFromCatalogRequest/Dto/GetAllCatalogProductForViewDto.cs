using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.UR.BuyFromCatalogRequest.Dto
{
    public class GetAllCatalogProductForViewDto : EntityDto<long>
    {
        public long? InventoryGroupId { get; set; }
        public Guid PicDepartmentId { get; set; }
        public string ProductGroupName { get; set; }
        public string ProductName { get; set; }
        [StringLength(40)]
        public string ProductCode { get; set; }
        public string Color { get; set; }
        public string PrimaryUomCode { get; set; }
        public long SupplierId { get; set; }
        [StringLength(255)]
        public string SupplierName { get; set; }
        public long CurrencyId { get; set; }
        [StringLength(15)]
        public string CurrencyCode { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? UnitPrice { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? TaxPrice { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public string ProductImage { get; set; }
        public long? InventoryItemId { get; set; }
        public int TotalCount { get; set; }
    }
}
