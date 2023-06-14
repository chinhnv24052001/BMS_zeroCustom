using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.CancelReason.Dto
{
    public class InputSearchCancelReasonDto : PagedAndSortedInputDto
    {
        public string Keyword { get; set; }
    }
}
