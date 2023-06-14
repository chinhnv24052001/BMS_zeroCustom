using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.UserControl.Dto
{
    public class UserChechBudgetDto
    {
        public long UserId { get; set; }
        public string UserName { get; set; }
        public string UserFullName { get; set; }
        public string DepartmentName { get; set; }
        public string DivisionName { get; set; }
        public string GroupName { get; set; }
        public bool? IsFinanceMA { get; set; }
        public bool? IsGroupManageRight { get; set; }
        public bool IsCheck { get; set; }
    }
}
