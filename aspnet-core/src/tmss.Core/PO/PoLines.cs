using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PO
{
    public class PoLines : FullAuditedEntity<long>, IEntity<long>
    {
        public long? PoHeaderId { get; set; }
        public long? LineTypeId { get; set; }
        public int? LineNum { get; set; }
        public long? ItemId { get; set; }
        public long? CategoryId { get; set; }
        public long? UrLineId { get; set; }
        public string ItemDescription { get; set; }
        public string UnitMeasLookupCode { get; set; }
        public string AllowPriceOverrideFlag { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? ListPricePerUnit { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? UnitPrice { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? ForeignPrice { get; set; }
        public decimal? Quantity { get; set; }
        public decimal? QtyRcvTolerance { get; set; }
        public string OverToleranceErrorFlag { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? MarketPrice { get; set; }
        public string UnorderedFlag { get; set; }
        public string CancelFlag { get; set; }
        public long? CancelledBy { get; set; }
        public DateTime? CancelDate { get; set; }
        public string CancelReason { get; set; }
        public string FirmStatusLookupCode { get; set; }
        public string TaxableFlag { get; set; }
        public string TaxName { get; set; }
        public string CapitalExpenseFlag { get; set; }
        public string NegotiatedByPreparerFlag { get; set; }
        public string Attribute1 { get; set; }
        public string Attribute2 { get; set; }
        public string Attribute3 { get; set; }
        public string Attribute4 { get; set; }
        public string Attribute5 { get; set; }
        public string Attribute6 { get; set; }
        public string Attribute7 { get; set; }
        public string Attribute8 { get; set; }
        public string Attribute9 { get; set; }
        public string Attribute10 { get; set; }
        public string ReferenceNum { get; set; }
        public string Attribute11 { get; set; }
        public string Attribute12 { get; set; }
        public string Attribute13 { get; set; }
        public string PriceTypeLookupCode { get; set; }
        public string ClosedCode { get; set; }
        public DateTime? ClosedDate { get; set; }
        public string ClosedReason { get; set; }
        public long? ClosedBy { get; set; }
        public long? OrgId { get; set; }
    }
}
