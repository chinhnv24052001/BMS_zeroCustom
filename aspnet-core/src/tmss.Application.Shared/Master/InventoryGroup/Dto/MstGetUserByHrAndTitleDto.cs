using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.InventoryGroup.Dto
{
    public class MstGetUserByHrAndTitleDto
    {
        public int UserId { get; set; }
        public int TitleId { get; set; }
        public Guid HrId { get; set; }
        public string UserName { get; set; }
        public string TitleName { get; set; }
        public string HrName { get; set; }
    }
}
