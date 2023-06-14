using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.BMS.Master.BmsPeriod.Dto
{
    public class InputBmsMstPeriodDto
    {
        public long Id { get; set; }
        public string PeriodName { get; set; }
        public int PeriodYear { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime Todate { get; set; }
        public string Description { get; set; }
        public bool IsActive { get; set; }
    }
}
