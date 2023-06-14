using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Currency;
using tmss.Master.LineType;
using tmss.Master.LineType.Dto;

namespace tmss.Master
{
    public class MstLineTypeAppService : tmssAppServiceBase, IMstLineTypeAppService
    {
        private readonly IRepository<MstLineType, long> _mstLineTypeRepository;
        public MstLineTypeAppService(IRepository<MstLineType, long> mstLineTypeRepository)
        {
            _mstLineTypeRepository = mstLineTypeRepository;
        }
        public async Task<List<GetMstLineTypeDto>> getAllLineTypes()
        {
            var listLineType = from lineType in _mstLineTypeRepository.GetAll().AsNoTracking()
                               select new GetMstLineTypeDto()
                               {
                                   Id = lineType.Id,
                                   LineTypeCode = lineType.LineTypeCode,
                                   LineTypeName = lineType.LineTypeName,
                               };
            return listLineType.ToList();
        }
    }
}
