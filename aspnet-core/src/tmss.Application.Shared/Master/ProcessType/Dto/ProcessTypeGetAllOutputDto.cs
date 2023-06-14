using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.ProcessType.Dto
{
    public class ProcessTypeGetAllOutputDto
    {
        public long Id { get; set; }
        public string ProcessTypeCode {get;set;}
        public string ProcessTypeName { get; set; }
    }
}
