using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.ImportExcel.PurchasePurpose.Dto
{
    public class PurchasePurposeImportDto
    {
        public long Id { get; set; }
        public string PurchasePurposeName { get; set; }
        public string PurchasePurposeCode { get; set; }
        public int? HaveBudgetCode { get; set; }
        public int? Status { get; set; }
        public string Remark { get; set; }
    }
}
