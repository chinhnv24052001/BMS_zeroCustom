using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.Master.Segment1.Dto
{
    public class SearchTypeCostDto: PagedAndSortedInputDto
    {
        public string TypeCostName { get; set; }
    }
}
