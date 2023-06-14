using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class GetPurchaseRequestDistributionsDto
    {
        public long Id { get; set; }
        public string ChargeAccount { get; set; }
        public decimal? RecoverRate { get; set; }
        public decimal? Quantity { get; set; }
        public DateTime? GlDate { get; set; }
        public string BudgetAccount { get; set; }
        public string AccrualAccount { get; set; }
        public string VarianceAccount { get; set; }
    }
}
