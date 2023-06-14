using Abp.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Province;
using tmss.Master.Province.Dto;

namespace tmss.Master
{
    public class MstProvinceAppService : tmssAppServiceBase, IMstProvinceAppService
    {
        private readonly IRepository<MstProvince, long> _mstProvinceRepository;
        public MstProvinceAppService(IRepository<MstProvince, long> mstProvinceRepository)
        {
            _mstProvinceRepository = mstProvinceRepository;
        }

        public async Task<List<GetByNationIdOutputDto>> GetByNationId()
        {
            var lstProvince = from mstProvince in _mstProvinceRepository.GetAll()
                                select new GetByNationIdOutputDto()
                                {
                                    Id = mstProvince.Id,
                                    ProvinceName = mstProvince.ProvinceName,
                                    NationId = mstProvince.NationId,
                                };
            return lstProvince.ToList();
        }
    }
}
