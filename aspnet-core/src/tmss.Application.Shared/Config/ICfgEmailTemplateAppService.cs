using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Config.Dto;

namespace tmss.Config
{
    public interface ICfgEmailTemplateAppService
    {
        Task<EmailTemplateOuputDto> GetTemplateByCode(string emailTemplateCode);
    }
}
