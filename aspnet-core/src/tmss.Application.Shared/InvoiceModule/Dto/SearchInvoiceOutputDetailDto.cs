using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.InvoiceModule.Dto
{
    public class SearchInvoiceOutputDetailDto
    {
        public long? Id { get; set; }  
        public string PoNumber { get; set; }
        public long? PoHeaderId { get; set; }
        public string ItemNumber { get; set; }
        public string ItemDescription { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? Quantity { get; set; }
        public string QuantityStr { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? QuantityOrder { get; set; }
        public string QuantityOrderStr { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? ForeignPrice { get; set; }
        public string ForeignPriceStr { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? QuantityReceived { get; set; }
        public string QuantityReceivedStr { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? QuantityMatched { get; set; }
        public string QuantityMatchedStr { get; set; }
        public decimal? QuantityGR { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? QuantityPayment { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? QtyRemainGR { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? ToVnd { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? VndPrice { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? Amount { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? TotalAmount { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? TaxRate { get; set; }     
        public string TaxRateStr { get; set; }
        public long? InvoiceId { get; set; }
        public long? ItemId { get; set; }
        public long? CategoryId { get; set; }
        public int? LineNum { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? RemainQty { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? AmountVat { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? UnitPrice { get; set; }
        public int? PoId { get; set; }
        public string ERROR_DESCRIPTION { get; set; }
        public string InvoiceNum { get; set; }
        public string Status { get; set; }
        public long? VendorId { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? UnitPricePO { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? QtyInvoice { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal? RemainQtyActual { get; set; }
        [StringLength(255)]
        public string Note { get; set; }
        public bool? IsSkipInvCheck { get; set; }
    }
}
