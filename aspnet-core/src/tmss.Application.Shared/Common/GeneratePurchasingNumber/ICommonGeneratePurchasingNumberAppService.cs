using Abp.Application.Services;
using System.Threading.Tasks;
using tmss.GR.Enum;

namespace tmss.Common.GeneratePurchasingNumber
{
    public interface ICommonGeneratePurchasingNumberAppService : IApplicationService
    {
        Task<string> GenerateRequestNumber(GenSeqType type);
    }
}
