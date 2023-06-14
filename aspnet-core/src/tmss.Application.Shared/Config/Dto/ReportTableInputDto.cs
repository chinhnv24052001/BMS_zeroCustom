using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Config.Dto
{
    public class ReportTableInputDto
    {
        public string HashTag { get; set; }
        public List<object> RowData { get; set; }
    }
}
