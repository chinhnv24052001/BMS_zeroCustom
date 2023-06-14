using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Categories.Dto;
using tmss.Master.LineType.Dto;

namespace tmss.Master.LineType
{
    public interface IMstLineTypeAppService : IApplicationService
    {
        Task<List<GetMstLineTypeDto>> getAllLineTypes();
    }
}
