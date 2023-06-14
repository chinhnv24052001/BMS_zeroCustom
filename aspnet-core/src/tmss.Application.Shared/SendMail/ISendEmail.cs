using Abp.Application.Services;
using System.Threading.Tasks;
using tmss.RequestApproval.Dto;

namespace tmss.SendMail
{
    public interface ISendEmail: IApplicationService
    {
        Task SendMailForDelayPayment(DelayPaymentEmailContent input);
        Task SendEmail(SendEmailContent input);
        Task sendEmailPoToSupplier(SendEmailContent input, string poNumber);
    }
}
