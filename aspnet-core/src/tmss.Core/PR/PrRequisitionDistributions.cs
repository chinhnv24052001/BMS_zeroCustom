using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using PayPalCheckoutSdk.Orders;
using System.ComponentModel.DataAnnotations.Schema;

namespace tmss.PR
{
    public class PrRequisitionDistributions : FullAuditedEntity<long>, IEntity<long>
    {
        public long? PrRequisitionLineId { get; set; }
        public long? CodeCombinationId { get; set; }
        public decimal? ReqLineQuantity { get; set; }
        public string EncumberedFlag { get; set; }
        public DateTime? GlEncumberedDate { get; set; }
        public string GlEncumberedPeriodName { get; set; }
        public DateTime? GlCancelledDate { get; set; }
        public long? BudgetAccountId { get; set; }
        public long? AccrualAccountId { get; set; }
        public long? VarianceAccountId { get; set; }
        public string PreventEncumbranceFlag { get; set; }
        public int? DistributionNum { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? RecoverableTax { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? NonrecoverableTax { get; set; }
        public string TaxRecoveryOverrideFlag { get; set; }
        public decimal? RecoverRate { get; set; }

    }
}
