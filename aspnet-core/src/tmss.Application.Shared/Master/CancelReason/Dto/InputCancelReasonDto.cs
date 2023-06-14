using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.CancelReason.Dto
{
    public class InputCancelReasonDto
    {
        public long Id { get; set; }
        public string Code { get; set; }
        public string Type { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
    }
}
