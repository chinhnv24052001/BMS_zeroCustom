using Abp.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Config.Dto;

namespace tmss.Config
{
    public class CfgEmailTemplateAppService : tmssAppServiceBase, ICfgEmailTemplateAppService
    {
        private readonly IRepository<CfgEmailTemplate, long> _cfgEmailTemplateRepository;
        public CfgEmailTemplateAppService(IRepository<CfgEmailTemplate, long> cfgEmailTemplateRepository)
        {
            _cfgEmailTemplateRepository = cfgEmailTemplateRepository;
        }
        public async Task<EmailTemplateOuputDto> GetTemplateByCode(string emailTemplateCode)
        {
            EmailTemplateOuputDto emailTemplateOuputDto   = new EmailTemplateOuputDto();
            var cfgEmailTemplate =   _cfgEmailTemplateRepository.GetAll().Where(p => p.EmailTemplateCode == emailTemplateCode).FirstOrDefault();
            emailTemplateOuputDto.EmailTemplateContent = cfgEmailTemplate.EmailTemplateContent;
            return emailTemplateOuputDto;
        }
    }
}
