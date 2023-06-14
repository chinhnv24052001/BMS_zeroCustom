using Abp.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.District;
using tmss.Master.District.Dto;

namespace tmss.Master
{
    public class MstDistrictAppService : tmssAppServiceBase, IMstDistrictAppService
    {
        private readonly IRepository<MstDistrict, long> _mstDistrictRepository;
        public MstDistrictAppService(IRepository<MstDistrict, long> mstDistrictRepository)
        {
            _mstDistrictRepository = mstDistrictRepository;
        }
        public async Task<List<GetByProvinceIdOutputDto>> GetByProvinceId()
        {
            var lstDistrict = from mstDistrict in _mstDistrictRepository.GetAll()
                              select new GetByProvinceIdOutputDto()
                              {
                                  Id = mstDistrict.Id,
                                  DistrictName = mstDistrict.DistrictName,
                                  ProvinceId = mstDistrict.ProviceId,
                              };
            return lstDistrict.ToList();
        }
    }
}
