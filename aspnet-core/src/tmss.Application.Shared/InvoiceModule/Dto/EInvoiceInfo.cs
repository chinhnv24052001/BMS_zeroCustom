using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.InvoiceModule.Dto
{
    public class EInvoiceInfo
    {
        public EInvoiceInfo()
        {
            Items = new List<EItemInfo>();
            invoiceFiles = new List<InvoiceFile>();
        }
        public string SerialNo { get; set; }
        public string InvoiceNum { get; set; }
        public DateTime InvoiceDate { get; set; }
        public string Currency { get; set; }
        public long InvoiceAmountWithVAT { get; set; }
        public long InvoiceAmountBeforeVAT { get; set; }
        public long VATAmount { get; set; }
        public string PO { get; set; }
        public string SellerTaxCode { get; set; }
        public List<EItemInfo> Items { get; set; }
        public List<InvoiceFile> invoiceFiles { get; set; }
    }
    public class EItemInfo
    {
        public string PoNo { get; set; }
        public string PartNo { get; set; }
        public string Site { get; set; }
        public long DistAmount { get; set; }
        public string DistAccount { get; set; }
        public string DistDescription { get; set; }
        public long BusinessUserId { get; set; }
        public DateTime? GLDate { get; set; }
        public string InvoiceSource { get; set; }
        public string ImportCode { get; set; }
        public string UnitOfMeasure { get; set; }
        public decimal QuantityInvoiced { get; set; }
        public DateTime? AccountingDate { get; set; }
        [Column(TypeName = "decimal(18, 5)")]
        public decimal UnitPrice { get; set; }
        public long VATAmount { get; set; }
        public string VATRate { get; set; }
    }

    public class InvoiceFile
    {
        public string OriginalFileName { get; set; }
        public string ServerFileName { get; set; }
        public string FileType { get; set; }
    }
}
