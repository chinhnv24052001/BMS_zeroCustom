using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.InvoiceModule.Dto
{
    public class GetAllPoLinesForUpdateInvoiceDto : EntityDto<long>
    {
        [StringLength(15)]
        public string PoNumber { get; set; }
        [StringLength(240)]
        public string PartName { get; set; }
        [StringLength(240)]
        public string PartNameSupplier { get; set; }
        [StringLength(40)]
        public string PartNo { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal UnitPrice { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal PoQuantity { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal QuantityGR { get; set; }
        public bool? IsSkipInvCheck { get; set; }
        public long? ItemId { get; set; }
    }
}
