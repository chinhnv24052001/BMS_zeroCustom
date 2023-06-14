using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.BudgetPIC.Dto
{
    public class InputBudgetTransferDto
    {
        public long Id { get; set; }
        public DateTime? Date { get; set; }
        public string TransferNo { get; set; }
        public long FromDepId { get; set; }
        public string FromPICName { get; set; }
        public string FromPICNoEmail { get; set; }
        public long FromBudgetId { get; set; }
        public int FromRemaining { get; set; }
        public string BudgetName1 { get; set; }
        public string FromDepName { get; set; }

        public long ToDepId { get; set; }
        public string ToPICName { get; set; }
        public long ToPICUserId { get; set; }
        public string ToPICNoEmail { get; set; }
        public long ToBudgetId { get; set; }
        public int ToRemaining { get; set; }
        public string BudgetName2 { get; set; }
        public string ToDepName { get; set; }

        public int AmountTransfer { get; set; }
        public string Purpose { get; set; }
        public long Status { get; set; }
        public long Type { get; set; }
        public List<BudgetTransferItemDto> BudgetTransferItemDtos { get; set; }
    }
}
