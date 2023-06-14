using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Price.Dto
{
    public class PrcAppendixContractDto
    {
        public long? Id { get; set; }
        public long? AppendixId { get; set; }
        public long? CreatorUserId { get; set; }
        public string AppendixNo { get; set; }
        public DateTime? AppendixDate { get; set; }
        public DateTime? EffectiveFrom { get; set; }
        public DateTime? EffectiveTo { get; set; }
        public long? ContractId { get; set; }
        public string ContractNo { get; set; }
        public string Description { get; set; }
        public string ApprovalStatus { get; set; }
        public string Signer_By { get; set; }
        public string Signer_By_Suplier { get; set; }
        public decimal? TotalAmount { get; set; }
        public long? CountItem { get; set; }
        public string SupplierName { get; set; }
        public int? ExpiryBackdate { get; set; }
        public string NoteOfBackdate { get; set; }
        public string TitleSigner { get; set; }
        public string TitleSignerNcc { get; set; }
        public string PlaceOfDelivery { get; set; }
        public string Shipment { get; set; }
        public string PaidBy { get; set; }
        public string Orthers { get; set; }
        public long SupplierId { get; set; }
        public bool? IsBackdate { get; set; }
    }
}
