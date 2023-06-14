using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.BmsPeriod.Dto
{
    public class BmsPeriodVersionDto
    {
        public long Id { get; set; }
        public string PeriodName { get; set; }
        public string VersionName { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
        public string StatusString { get; set; }
    }
}
