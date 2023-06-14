using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.UnitOfMeasure.Dto
{
    public class UnitOfMeasureDto
    {
        public long Id { get; set; }
        public string UnitOfMeasure { get; set; }
        public string UOMCode { get; set; }
        public string UOMClass { get; set; }
        public string Description { get; set; }
        public string Status { get; set; }
    }
}
