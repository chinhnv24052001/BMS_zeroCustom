using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.InventoryCodeConfig.Dto
{
    public class InputSearchInventoryCodeConfigDto : PagedAndSortedInputDto
    {
        public string InventoryGroupCode { get; set; }
        public string InventoryGroupName { get; set; }

    }
}
