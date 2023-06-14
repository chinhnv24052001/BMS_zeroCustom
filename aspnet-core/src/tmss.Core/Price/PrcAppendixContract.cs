using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Diagnostics.Contracts;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Price
{
    public class PrcAppendixContract : FullAuditedEntity<long>, IEntity<long>
    {
        public string AppendixNo { get; set; }
        public DateTime? AppendixDate {get; set; }
        public DateTime? EffectiveFrom {get; set; }
        public DateTime? EffectiveTo {get; set; }
        public  string Description {get; set; }
        public long? ContractId {get; set; }
        public  string ApprovalStatus {get; set; }
        public decimal? TotalAmount {get; set; }
        public  string Signer_By {get; set; }
        public  string SeqNo {get; set; }
        public  string SignerBySupplier {get; set; }
        public  string TitleSigner {get; set; }
        public  string TitleSignerNcc {get; set; }
        public  string PlaceOfDelivery {get; set; }
        public  string Shipment {get; set; }
        public  string PaidBy {get; set; }
        public  string Orthers {get; set; }
        public int? ExpiryBackdate {get; set; }
        public  string NoteOfBackdate {get; set; }
        public bool? IsBackdate {get; set; }

    }
}
