using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Locations.Dto;
using tmss.Master.Organizations.Dto;

namespace tmss.Master.Organizations
{
    public interface IMstOrganizationsAppService : IApplicationService
    {
        Task<List<GetMstOrganizationsDto>> getAllOrganizations();
    }
}
