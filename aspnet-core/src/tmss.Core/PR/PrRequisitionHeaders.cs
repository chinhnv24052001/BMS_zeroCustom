using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.PR
{
    public class PrRequisitionHeaders : FullAuditedEntity<long>, IEntity<long>
    {
        public long? PreparerId { get; set; }
        public long? PurchasePurposeId { get; set; }
        public string RequisitionNo { get; set; }
        public string AuthorizationStatus { get; set; }
        public string CheckBudgetStatus { get; set; }
        public long? RequestId { get; set; }
        public string Description { get; set; }
        public string TypeLookupCode { get; set; }
        public string DepartmentApprovalName { get; set; }
        public string ChargeAccount { get; set; }
        public string CurrencyCode { get; set; }
        public string OriginalCurrencyCode { get; set; }
        public long? OrgId { get; set; }
        public decimal? TotalPrice { get; set; }
        public decimal? TotalPriceUsd { get; set; }
        public DateTime? ApprovedDate { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? PicUserId { get; set; }
        public Guid? PicDepartmentId { get; set; }
        public DateTime? RateDate { get; set; }
        public decimal? CurrencyRate { get; set; }

    }
}
