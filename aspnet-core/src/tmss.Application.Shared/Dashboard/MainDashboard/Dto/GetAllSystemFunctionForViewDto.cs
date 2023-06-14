using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace tmss.Dashboard.MainDashboard.Dto
{
    public class GetAllSystemFunctionForViewDto : EntityDto<long>
    {
        [StringLength(255)]
        public string FunctionName { get; set; }
        [StringLength(255)]
        public string FunctionKey { get; set; }
    }
}
