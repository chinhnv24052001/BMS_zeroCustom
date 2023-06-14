using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.ProcessType.Dto;

namespace tmss.Master.ProcessType
{
    public interface IMstProcessTypeAppService
    {
        Task<List<ProcessTypeGetAllOutputDto>> GetAll(bool HasEmpty);
    }
}
