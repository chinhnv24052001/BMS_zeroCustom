using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.UserControl.Dto
{
    public class UserBudgetControlDto
    {
        public long Id { get; set; }    
        public string BudgetCode { get; set; }    
        public string Division { get; set; }    
        public string Department { get; set; }    
        public bool IsCheck { get; set; }
    }
}
