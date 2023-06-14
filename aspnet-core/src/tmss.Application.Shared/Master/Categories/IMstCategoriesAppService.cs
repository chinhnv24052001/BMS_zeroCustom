using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Categories.Dto;
using tmss.Master.PurchasePurpose.Dto;

namespace tmss.Master.Categories
{
    public interface IMstCategoriesAppService : IApplicationService
    {
        Task<List<GetMstCategotiesDto>> getAllCategoties(SearchCategoriesDto searchCategoriesDto);
    }
}
