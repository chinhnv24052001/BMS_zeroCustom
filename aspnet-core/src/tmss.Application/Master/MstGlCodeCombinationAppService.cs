using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Abp.Linq.Extensions;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Master.GlCode;
using tmss.Master.GlCode.Dto;

namespace tmss.Master
{
    public class MstGlCodeCombinationAppService : tmssAppServiceBase, IMstGlCodeCombinationAppService
    {
        private readonly IRepository<MstGlCodeCombination, long> _mstGlCodeCombinationRepository;
        public MstGlCodeCombinationAppService(IRepository<MstGlCodeCombination, long> mstGlCodeCombinationRepository)
        {
            _mstGlCodeCombinationRepository = mstGlCodeCombinationRepository;
        }

        [AbpAuthorize(AppPermissions.MasterBudgetCode_Search)]
        public async Task<PagedResultDto<SearchGlCodeOutputDto>> GetAllData(SeachGlCodeInputDto seachGlCodeInputDto)
        {
            var lstGl = from mstGL in _mstGlCodeCombinationRepository.GetAll()
                                .Where(p=>string.IsNullOrWhiteSpace(seachGlCodeInputDto.Keyword) || p.ConcatenatedSegments.Contains(seachGlCodeInputDto.Keyword))
                                select new SearchGlCodeOutputDto()
                                {
                                    Id = mstGL.Id,
                                    ConcatenatedSegments = mstGL.ConcatenatedSegments,
                                    BudgetName =""
                                };
            var pagedAndFilteredInfo = lstGl.PageBy(seachGlCodeInputDto);
            int totalCount = await lstGl.CountAsync();
            return new PagedResultDto<SearchGlCodeOutputDto>(
                       lstGl.Count(),
                       pagedAndFilteredInfo.ToList()
                      );
        }
    }
}
