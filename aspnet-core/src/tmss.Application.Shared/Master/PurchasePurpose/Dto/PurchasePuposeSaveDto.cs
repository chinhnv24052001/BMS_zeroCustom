using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.PurchasePurpose.Dto
{
    public class PurchasePuposeSaveDto
    {
        public long Id { get; set; }
        public string PurchasePurposeName { get; set; }
        public string PurchasePurposeCode { get; set; }
        public bool? HaveBudgetCode { get; set; }
        public int Status { get; set; }
    }
}
