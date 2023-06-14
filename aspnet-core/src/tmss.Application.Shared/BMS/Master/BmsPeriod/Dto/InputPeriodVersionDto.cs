using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.BmsPeriod.Dto
{
    public class InputPeriodVersionDto
    {
        public long Id { get; set; }
        public long PeriodId { get; set; }
        public long VersionId { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }
}
