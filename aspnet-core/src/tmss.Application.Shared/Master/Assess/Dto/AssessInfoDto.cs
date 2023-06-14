using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Assess.Dto
{
    public class AssessInfoDto: EntityDto<long?>
    {
        public string AssessName { get; set; }
        public double RateValue { get; set; }
        public List<AssessDetailInfoDto> AssessDetailList { get; set; }
    }
}
