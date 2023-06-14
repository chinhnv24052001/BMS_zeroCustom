using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.Master.PairingSegment.Dto
{
    public class SearchPairingDto : PagedAndSortedInputDto
    {
        public string FillterText { get; set; }
    }
}
