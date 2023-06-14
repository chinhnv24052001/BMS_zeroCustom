using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Organizations;
using tmss.Master.Organizations.Dto;

namespace tmss.Master
{
    public class MstOrganizationsAppService : tmssAppServiceBase, IMstOrganizationsAppService
    {
        private readonly IRepository<MstOrganizations, long> _mstMstOrganizationsRepository;
        public MstOrganizationsAppService(IRepository<MstOrganizations, long> mstMstOrganizationsRepository)
        {
            _mstMstOrganizationsRepository = mstMstOrganizationsRepository;
        }
        public async Task<List<GetMstOrganizationsDto>> getAllOrganizations()
        {
            var listOrganizations = from organizations in _mstMstOrganizationsRepository.GetAll().AsNoTracking()
                                    select new GetMstOrganizationsDto()
                                    {
                                        Id = organizations.Id,
                                        Name = organizations.Name,
                                        Language = organizations.Language,
                                        OrganizationCode = organizations.OrganizationCode,
                                        DisableDate = organizations.DisableDate,
                                        OperatingUnit = organizations.OperatingUnit,
                                        SourceLang = organizations.SourceLang
                                    };
            return listOrganizations.ToList();
        }
    }
}
