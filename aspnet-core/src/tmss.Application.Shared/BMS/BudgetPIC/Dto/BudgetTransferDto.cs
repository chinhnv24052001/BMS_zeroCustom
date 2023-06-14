using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.BudgetPIC.Dto
{
    public class BudgetTransferDto
    {
        public long Id { get; set; }
        public DateTime? Date { get; set; }
        public string TransferNo { get; set; }
        public int AmountTransfer { get; set; }
        public string Purpose { get; set; }
        public string Status { get; set; }
        public long StatusId { get; set; }
        public string FromBudgetCode { get; set; }
        public string FromBudgetName { get; set; }
        public int FromRemaining { get; set; }
        public string ToBudgetCode { get; set; }
        public string ToBudgetName { get; set; }
        public int ToRemaining { get; set; }
        public string Type { get; set; }
        public long TypeId { get; set; }

    }
}
