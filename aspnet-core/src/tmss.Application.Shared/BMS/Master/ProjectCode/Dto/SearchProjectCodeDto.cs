using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.Master.ProjectCode.Dto
{
    public class SearchProjectCodeDto : PagedAndSortedInputDto
    {
        public string FillterText { get; set; }
        public long PeriodId { get; set; }

    }
}
