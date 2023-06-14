using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Province.Dto;

namespace tmss.Master.Province
{
    public interface IMstProvinceAppService
    {
        Task<List<GetByNationIdOutputDto>> GetByNationId();
    }
}
