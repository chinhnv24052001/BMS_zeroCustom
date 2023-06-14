using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System.Threading.Tasks;
using tmss.ExcelDataReader.Dto;
using tmss.UR.UserRequestManagement.Dto;

namespace tmss.UR.UserRequestManagement
{
    public interface IUrUserRequestManagementAppService : IApplicationService
    {
        Task<PagedResultDto<GetAllUserRequestForViewDto>> GetAllUserRequests(GetAllUserRequestInput input);
        Task<UserRequestExcelDataDto> CheckValidateData(UserRequestExcelDataDto input);
        Task<PagedResultDto<GetAllUserRequestForPrDto>> GetAllUserRequestForPr(GetAllUserRequestForPrInputDto input);
    }
}
