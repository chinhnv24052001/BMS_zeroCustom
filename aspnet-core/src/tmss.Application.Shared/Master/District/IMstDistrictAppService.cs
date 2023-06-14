using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.District.Dto;

namespace tmss.Master.District
{
    public interface IMstDistrictAppService
    {
        Task<List<GetByProvinceIdOutputDto>> GetByProvinceId();
    }
}
