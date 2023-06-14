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
    public class PoDistributions : FullAuditedEntity<long>, IEntity<long>
    {
        public long? PoLineShipmentId { get; set; }
        public long? PrRequisitionDistributionId { get; set; }
        public long? PoHeaderId { get; set; }
        public long? PoLineId { get; set; }
        public long? SetOfBooksId { get; set; }
        public long? CodeCombinationId { get; set; }
        public decimal? QuantityOrdered { get; set; }
        public decimal? QuantityDelivered { get; set; }
        public decimal? QuantityBilled { get; set; }
        public decimal? QuantityCancelled { get; set; }
        public long? DeliverToLocationId { get; set; }
        public long? DeliverToPersonId { get; set; }
        public DateTime? RateDate { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? Rate { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? AmountBilled { get; set; }
        public string AccruedFlag { get; set; }
        public string EncumberedFlag { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? EncumberedAmount { get; set; }
        public DateTime? GlEncumberedDate { get; set; }
        public string GlEncumberedPeriodName { get; set; }
        public DateTime? GlCancelledDate { get; set; }
        public string DestinationTypeCode { get; set; }
        public long? DestinationOrganizationId { get; set; }
        public string DestinationSubinventory { get; set; }
        public long? BudgetAccountId { get; set; }
        public long? AccrualAccountId { get; set; }
        public long? VarianceAccountId { get; set; }
        public string PreventEncumbranceFlag { get; set; }
        public string DestinationContext { get; set; }
        public int? DistributionNum { get; set; }
        public long? RequestId { get; set; }
        public string AccrueOnReceiptFlag { get; set; }
        public long? OrgId { get; set; }
        public string TaxRecoveryOverrideFlag { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? RecoverableTax { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? NonrecoverableTax { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? RecoveryRate { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? AmountDelivered { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? AmountCancelled { get; set; }
        public string DistributionType { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? AmountFunded { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? FundedValue { get; set; }
        public string PartialFundedFlag { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? QuantityFunded { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? ChangeInFundedValue { get; set; }
        [Column(TypeName = "decimal(18, 5)")] public decimal? AmountReversed { get; set; }

        public decimal? QuantityReceived { get; set; }
        public decimal? QuantityShipped { get; set; }

    }
}
