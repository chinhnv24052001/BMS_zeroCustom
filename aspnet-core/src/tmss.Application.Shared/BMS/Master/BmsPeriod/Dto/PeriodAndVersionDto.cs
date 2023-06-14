using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.BmsPeriod.Dto
{
    public class PeriodAndVersionDto
    {
        public long PeriodId { get; set; }
        public string PeriodName { get; set; }
        public int PeritodYear { get; set; }
        public long PeriodVersionId { get; set; }
        public string PerisodVersionName { get; set; }
    }
}
