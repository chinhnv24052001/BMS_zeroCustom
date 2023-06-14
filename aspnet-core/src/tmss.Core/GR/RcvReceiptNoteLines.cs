using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.GR
{
    public class RcvReceiptNoteLines : FullAuditedEntity<long>, IEntity<long>
    {
        public long ReceiptNoteHeaderId { get; set; }
        public int LineNum { get; set; }
        public long? CategoryId { get; set; }
        public decimal? QuantityShipped { get; set; }
        public decimal? QuantityReceived { get; set; }
        public decimal? QuantityOrdered { get; set; }
        public string UnitOfMeasure { get; set; }
        public string ItemDescription { get; set; }
        public long? ItemId { get; set; }
        public string ItemRevision { get; set; }
        public string ShipmentLineStatusCode { get; set; }
        public string SourceDocumentCode { get; set; }
        public long? PoHeaderId { get; set; }
        public long? PoLineId { get; set; }
        public long? DeliverToPersonId { get; set; }
        public long? EmployeeId { get; set; }
        public string PrimaryUnitOfMeasure { get; set; }
        public long? AmountReceived { get; set; }
        public string PartNo { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public DateTime? FinishedDate { get; set; }
        public bool IsManuallyAdded { get; set; }
    }
}
