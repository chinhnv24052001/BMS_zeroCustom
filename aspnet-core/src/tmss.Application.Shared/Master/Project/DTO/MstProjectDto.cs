using System;

namespace tmss.Master.Dto
{
    public class MstProjectDto
    {
        public long Id { get; set; }
        public string ProjectCode { get; set; }
        public string ProjectName { get; set; }
        public int? NumberStage { get; set; }
        public DateTime? StartDateActive { get; set; }
        public DateTime? EndDateActive { get; set; }
        public string Status { get; set; }        
        public string Category { get; set; }
    }
}
