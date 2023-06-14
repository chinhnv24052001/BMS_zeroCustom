using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.Master.UnitOfMeasure.Dto
{
    public class UnitOfMeasureInputSearchDto: PagedAndSortedInputDto
    {
        public string UnitOfMeasure { get; set; }
        public string UOMCode { get; set; }
        public string UOMClass { get; set; }
        //public string Description { get; set; }
    }
}
