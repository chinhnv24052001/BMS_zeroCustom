using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.BMS.Master.Segment2.Dto
{
    public class SearchProjectTypeDto: PagedAndSortedInputDto
    {
        public string ProjectTypeName { get; set; }
    }
}
