using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.UserControl.Dto
{
    public class BmsUserRoleDto
    {
        public long UserId { get; set; }    
        public bool? IsFinanceMA { get; set; }
        public bool? IsGroupManageRight { get; set; }
    }
}
