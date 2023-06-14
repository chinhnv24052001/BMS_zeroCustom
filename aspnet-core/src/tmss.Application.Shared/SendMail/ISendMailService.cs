using Abp.Application.Services;
using System.Threading.Tasks;

namespace tmss.SendMail
{
    public interface ISendMailService : IApplicationService
    {
        Task SendMail(MailContent mailContent);
    }
}
