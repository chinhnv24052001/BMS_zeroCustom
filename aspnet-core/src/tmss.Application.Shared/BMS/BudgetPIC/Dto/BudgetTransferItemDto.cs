using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.BudgetPIC.Dto
{
    public class BudgetTransferItemDto
    {
        public long Id { get; set; }
        public string Description { get; set; }
        public int Amount { get; set; }
        public string Remarks { get; set; }
        public long BudgetTransferId { get; set; }
    }
}
