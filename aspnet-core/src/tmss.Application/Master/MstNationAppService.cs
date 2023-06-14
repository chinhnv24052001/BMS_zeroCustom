using Abp.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Nation;
using tmss.Master.Nation.Dto;

namespace tmss.Master
{
    public class MstNationAppService : tmssAppServiceBase, IMstNationAppService
    {
        private readonly IRepository<MstNation, long> _mstNationRepository;
        public MstNationAppService(IRepository<MstNation, long> mstNationRepository)
        {
            _mstNationRepository = mstNationRepository;
        }
        public async Task<List<GetAllOutputDto>> GetAllNation()
        {
            var listMstNation =  from mstNation in _mstNationRepository.GetAll()
                                    select new GetAllOutputDto()
                                    {
                                        Id = mstNation.Id,
                                        NationName = mstNation.NationName 
                                    };
            return   listMstNation.ToList();
        }
    }
}
