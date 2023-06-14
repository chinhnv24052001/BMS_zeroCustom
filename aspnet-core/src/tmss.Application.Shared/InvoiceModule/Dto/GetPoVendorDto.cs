using System;

namespace tmss.InvoiceModule.Dto
{
    public class GetPoVendorDto
    {
        public long Id { get; set; }
        public string PONumber { get; set; }
        public DateTime CreationTime { get; set; }
        public string Comments { get; set; }
        public string SupplierName { get; set; }
        public string CurrencyCode { get; set; }
        public float? UnitPrice { get; set; }
        public float? QuantityOrder { get; set; }
        public float? Quantity { get; set; }
        public float? QuantityReceived { get; set; }
        public float? QtyInvoice { get; set; }
        public long? CategoryId { get; set; }
        public string ItemDescription { get; set; }
        public string ItemNumber { get; set; }
        public string PartNameSupplier { get; set; }
        public int LineNum { get; set; }
        public long? ItemId { get; set; }
        public long? VendorId { get; set; }
        public long PoHeaderId { get; set; }
        public int PoId { get; set; }
        public string PartNo { get; set; }
        public string ErrDescription { get; set; }
        public float? QtyRemain { get; set; }
        public decimal? InvoicePrice { get; set; }
        public string PartName { get; set; }
        public bool? IsSkipInvCheck { get; set; }
    }
}