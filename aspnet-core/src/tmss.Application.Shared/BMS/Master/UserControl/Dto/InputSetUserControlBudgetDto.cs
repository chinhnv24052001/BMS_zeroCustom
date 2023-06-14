 using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.UserControl.Dto
{
    public class InputSetUserControlBudgetDto
    {
        public long UserId { get; set; }
        public List<long> ListBudgetId { get; set; }
        public int? ManageType { get; set; }

    }
}
