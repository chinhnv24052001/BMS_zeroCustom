using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.LineType.Dto
{
    public class GetMstLineTypeDto
    {
        public long Id { get; set; }
        public string LineTypeCode { get; set; }
        public string LineTypeName { get; set; }
    }
}
