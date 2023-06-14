using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Period.Dto
{
    public class ListPeriodDto
    {
        public long Id { get; set; }
        public string PeriodName { get; set; }
        public int PeriodYear { get; set; }
        public bool IsCurrent { get; set; }
        public DateTime FromDate { get; set; }
        public DateTime Todate { get; set; }
        public string Description { get; set; }
    }
}
