using Abp.Domain.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.ProcessType;
using tmss.Master.ProcessType.Dto;

namespace tmss.Master
{
    public class MstProcessTypeAppService : tmssAppServiceBase, IMstProcessTypeAppService
    {
        private readonly IRepository<MstProcessType, long> mstProcessTypeRepository;
        public MstProcessTypeAppService(IRepository<MstProcessType, long> mstProcessTypeRepository)
        {
            this.mstProcessTypeRepository = mstProcessTypeRepository;
        }
        public async Task<List<ProcessTypeGetAllOutputDto>> GetAll(bool HasEmpty)
        {
            var processTypeGetAllOutputDtos =   (from processType in mstProcessTypeRepository.GetAll()
                                              select new ProcessTypeGetAllOutputDto()
                                              {
                                                  Id = processType.Id,
                                                  ProcessTypeCode = processType.ProcessTypeCode,
                                                  ProcessTypeName = processType.ProcessTypeName
                                              }).ToList();
            if (HasEmpty)
            {
                ProcessTypeGetAllOutputDto typeGetAllOutputDto   = new ProcessTypeGetAllOutputDto();
                typeGetAllOutputDto.Id = 0;
                typeGetAllOutputDto.ProcessTypeCode = "";
                typeGetAllOutputDto.ProcessTypeName = "";
                processTypeGetAllOutputDtos.Insert(0, typeGetAllOutputDto);
            }
            return processTypeGetAllOutputDtos  ;
        }
    }
}
