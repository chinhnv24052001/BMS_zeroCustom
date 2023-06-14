using Abp.Domain.Repositories;
using Abp.Net.Mail;
using Microsoft.AspNetCore.Http;
using System.Net.Mail;
using System.Threading.Tasks;
using tmss.Config;
using tmss.RequestApproval.Dto;

namespace tmss.SendMail
{
    public class SendEmailAppService : tmssAppServiceBase, ISendEmail
    {
        public readonly IEmailSender _emailSender;
        private readonly IRepository<CfgEmailTemplate, long> _emailTempRepo;

        public SendEmailAppService(IEmailSender emailSender, IRepository<CfgEmailTemplate, long> emailTempRepo)
        {
            _emailSender = emailSender;
            _emailTempRepo = emailTempRepo;
        }

        public async Task SendMailForDelayPayment(DelayPaymentEmailContent input)
        {
            MailMessage message = new MailMessage()
            {
                Subject = input.Subject,
                Body = input.ContentEmail,
                IsBodyHtml = true,
            };
            string[] multiReceiveEmail = input.ReceiveEmail;
            foreach (var email in multiReceiveEmail)
            {
                message.To.Add(email);
            }

            //string[] multiCCEmail = input.CCEmail.Split(',');
            //foreach (var email in multiCCEmail)
            //{
            //    message.CC.Add(email);
            //}

            await _emailSender.SendAsync(message);
        }

        public async Task sendEmailPoToSupplier(SendEmailContent input, string poNumber)
        {
            string link = @"http://192.168.2.183/app/main/home";
            var body = await _emailTempRepo.FirstOrDefaultAsync(e => e.EmailTemplateCode == "SEND_PO_TO_SUPPLIER");
            string htmlBody = body.EmailTemplateContent;
            htmlBody = htmlBody.Replace("<person>", input.Person);
            htmlBody = htmlBody.Replace("<PoNo>", poNumber);
            htmlBody = htmlBody.Replace("<link>", link);

            MailMessage message = new MailMessage()
            {
                Subject = input.Subject,
                Body = htmlBody,
                IsBodyHtml = true,
            };

            message.To.Add(input.Receiver);

            await _emailSender.SendAsync(message);
        }

        public async Task SendEmail(SendEmailContent input)
        {
            string link = @"http://192.168.2.183/app/main/home";
            var body = await _emailTempRepo.FirstOrDefaultAsync(e => e.EmailTemplateCode == input.EmailTemplateCode);

            if (input.EmailTemplateCode == AppConsts.SEND_APPROVAL_REQUEST)
            {
                if (body != null)
                {
                    string htmlBody = body.EmailTemplateContent;

                    htmlBody = htmlBody.Replace("<person>", input.Person).Replace("<from>", input.From).Replace("<document>", input.Document).Replace("<description>", input.Description)
                        .Replace("<status>", input.Status).Replace("<link>", link);

                    MailMessage message = new MailMessage()
                    {
                        Subject = input.Subject,
                        Body = htmlBody,
                        IsBodyHtml = true,
                    };

                    message.To.Add(input.Receiver);

                    await _emailSender.SendAsync(message);
                }
            }
            else if (input.EmailTemplateCode == AppConsts.REPLY_APPROVAL_REQUEST)
            {
                if (body != null)
                {
                    string htmlBody = body.EmailTemplateContent;

                    htmlBody = htmlBody.Replace("<person>", input.Person).Replace("<from>", input.From).Replace("<approvalPerson>", input.ApprovalPerson).Replace("<document>", input.Document).Replace("<description>", input.Description)
                        .Replace("<status>", input.Status).Replace("<link>", link);
                    MailMessage message = new MailMessage()
                    {
                        Subject = input.Subject,
                        Body = body.EmailTemplateContent,
                        IsBodyHtml = true,
                    };

                    message.To.Add(input.Receiver);

                    await _emailSender.SendAsync(message);
                }
            }
        }

      
    }
}
