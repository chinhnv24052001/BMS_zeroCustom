using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PO
{
    public class PoHeaders : FullAuditedEntity<long>, IEntity<long>
    {
        public long? AgentId { get; set; }
        public string TypeLookupCode { get; set; }
        public long? InventoryGroupId { get; set; }
        public string Segment1 { get; set; } //poNo
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public long? VendorContactId { get; set; }
        public long? ShipToLocationId { get; set; }
        public long? BillToLocationId { get; set; }
        public long? TermsId { get; set; }
        public decimal? TotalPrice { get; set; }
        public decimal? TotalPriceUsd { get; set; }
        public string CurrencyCode { get; set; }
        public decimal? CurrencyRate { get; set; }
        public string NoteOfSupplier { get; set; }
        public DateTime? RateDate { get; set; }
        public string AuthorizationStatus { get; set; }
        public string CheckBudgetStatus { get; set; }
        public string ApprovedFlag { get; set; }
        public string Description { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public string Comments { get; set; }
        public string DepartmentApprovalName { get; set; }
        public long? PersonSigningId { get; set; }
        public DateTime? ContractExpirationDate { get; set; }
        public string TermDescription { get; set; }
        public string CancelFlag { get; set; }
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
        public string Attribute11 { get; set; }
        public string Attribute12 { get; set; }
        public string Attribute13 { get; set; }
        public string Attribute14 { get; set; }
        public string Attribute15 { get; set; }
        public string ChargeAccount { get; set; }
        public string ClosedCode { get; set; }
        public string PoRef { get; set; }
        public long? RequestId { get; set; }
        public DateTime? SubmitDate { get; set; }
        public DateTime? ClmEffectiveDate { get; set; }
        public long? OrgId { get; set; }
        public bool? IsVendorConfirm { get; set; }
        public bool? IsPrepayReceipt { get; set; }
        public long? PicUserId { get; set; }
        public Guid? PicDepartmentId { get; set; }

    }
}
