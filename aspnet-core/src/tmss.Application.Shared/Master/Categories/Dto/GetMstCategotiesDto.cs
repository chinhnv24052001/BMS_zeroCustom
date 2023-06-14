using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Categories.Dto
{
    public class GetMstCategotiesDto
    {
        public long Id { get; set; }
        public long StructureId { get; set; }
        public string Segment1 { get; set; }
        public string Segment2 { get; set; }
    }
}
