using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Categories;
using tmss.Master.Categories.Dto;
using tmss.Master.Currency.Dto;
using tmss.Master.Currency;

namespace tmss.Master
{
    public class MstCategoriesAppService : tmssAppServiceBase, IMstCategoriesAppService
    {

        private readonly IRepository<MstCategories, long> _mstCategoriesRepository;
        public MstCategoriesAppService(IRepository<MstCategories, long> mstCategoriesRepository)
        {
            _mstCategoriesRepository = mstCategoriesRepository;
        }
        public async Task<List<GetMstCategotiesDto>> getAllCategoties(SearchCategoriesDto searchCategoriesDto)
        {
            var listCategories = from categories in _mstCategoriesRepository.GetAll().AsNoTracking()
                                 where (string.IsNullOrWhiteSpace(searchCategoriesDto.Segment1) || categories.Segment1.Contains(searchCategoriesDto.Segment1))
                                 select new GetMstCategotiesDto()
                                 {
                                     Id = categories.Id,
                                     StructureId = categories.StructureId,
                                     Segment1 = categories.Segment1,
                                     Segment2 = categories.Segment2
                                 };
            return listCategories.ToList();
        }
    }
}
