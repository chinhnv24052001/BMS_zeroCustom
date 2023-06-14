using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Price
{
    public class PrcContractTemplate : FullAuditedEntity<long>, IEntity<long>
    {
        public string ContractNo { get; set; }
        public DateTime? ContractDate {get; set; }
        public DateTime? EffectiveFrom {get; set; }
        public DateTime? EffectiveTo {get; set; }
        public string Description {get; set; }
        public string SeqNo {get; set; }
        public string DepartmentApprovalName {get; set; }
        public long? SupplierId {get; set; }
       public string  ApprovalStatus {get; set; }
       public string  ApproveBy {get; set; }
        public string ApproveName {get; set; }
        public decimal?TotalAmount {get; set; }
        public string Signer_By {get; set; }
        public long? InventoryGroupId {get; set; }
        public long? PaymentTermsId {get; set; }
        public string SignerBySupplier {get; set; }
        public string TitleSigner {get; set; }
        public string TitleSignerNcc {get; set; }
        public string PlaceOfDelivery {get; set; }
        public string Shipment {get; set; }
        public string PaidBy {get; set; }
        public string Orthers {get; set; }

    }
}
