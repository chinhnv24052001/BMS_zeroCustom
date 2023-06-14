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
using tmss.GR;
using tmss.GR.Dto;

namespace tmss.Master
{
    public class RcvRoutingHeadersAppService : tmssAppServiceBase, IRcvRoutingHeadersAppService
    {

        private readonly IRepository<RcvRoutingHeaders, long> _repository;
        public RcvRoutingHeadersAppService(IRepository<RcvRoutingHeaders, long> repository)
        {
            _repository = repository;
        }
        public async Task<List<GetRcvRoutingHeadersDto>> getAllRoutings()
        {
            var listCategories = from r in _repository.GetAll().AsNoTracking()
                                 select new GetRcvRoutingHeadersDto()
                                 {
                                     Id = r.Id,
                                     RoutingName = r.RoutingName, 
                                     Description = r.Description
                                 };
            return listCategories.ToList();
        }
    }
}
