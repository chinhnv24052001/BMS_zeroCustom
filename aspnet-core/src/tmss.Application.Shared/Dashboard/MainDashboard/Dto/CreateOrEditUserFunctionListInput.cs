using Abp.Application.Services.Dto;

namespace tmss.Dashboard.MainDashboard.Dto
{
    public class CreateOrEditUserFunctionListInput : EntityDto<long>
    {
        public long FunctionId { get; set; }
        public int Ordering { get; set; }
    }
}
