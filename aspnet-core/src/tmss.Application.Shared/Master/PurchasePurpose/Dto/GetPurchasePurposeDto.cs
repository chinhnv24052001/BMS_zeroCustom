using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.PurchasePurpose.Dto
{
    public class GetPurchasePurposeDto
    {
        public long Id { get; set; }
        public string PurchasePurposeName { get; set; }
        public string PurchasePurposeCode { get; set; }
        public bool? HaveBudgetCode { get; set; }
        public string Status { get; set; }
    }
}
