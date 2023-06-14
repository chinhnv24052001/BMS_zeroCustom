using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Nation.Dto;

namespace tmss.Master.Nation
{
    public interface IMstNationAppService
    {
        Task<List<GetAllOutputDto>> GetAllNation();
    }
}
