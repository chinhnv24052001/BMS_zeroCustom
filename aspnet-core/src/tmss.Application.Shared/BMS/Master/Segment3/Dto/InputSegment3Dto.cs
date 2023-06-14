using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.Segment3.Dto
{
    public class InputSegment3Dto
    {
        public long Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public long DivisionId { get; set; }
        public long DepartmentId { get; set; }
        public long PeriodId { get; set; }
        public string Description { get; set; }
    }
}
