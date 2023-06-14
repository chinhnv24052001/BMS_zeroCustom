using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Assess.Dto
{
    public class AssessDetailInfoDto : EntityDto<long?>
    {
        public long? AssessGroupId { get; set; }
        public long? AssessId { get; set; }
        public string AssessName { get; set; }
        public string AssessItemName { get; set; }
        public string Description { get; set; }
        public double RateValue { get; set; }
    }
}
