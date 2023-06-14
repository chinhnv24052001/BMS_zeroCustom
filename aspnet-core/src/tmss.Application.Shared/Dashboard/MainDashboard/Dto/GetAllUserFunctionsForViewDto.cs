using Abp.Application.Services.Dto;
using System.ComponentModel.DataAnnotations;

namespace tmss.Dashboard.MainDashboard.Dto
{
    public class GetAllUserFunctionsForViewDto : EntityDto<long>
    {
        [StringLength(255)]
        public string FunctionName { get; set; }
        [StringLength(255)]
        public string FunctionKey { get; set; }
        public long FunctionId { get; set; }
        public int Ordering { get; set; }
    }
}
