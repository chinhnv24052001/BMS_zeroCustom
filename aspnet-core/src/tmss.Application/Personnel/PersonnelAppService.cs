using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Authorization.Users;
using tmss.Master;
using tmss.Master.ApprovalTree.Dto;
using tmss.Master.Categories.Dto;
using tmss.Personnel.Dto;

namespace tmss.Personnel
{
    public class PersonnelAppService : tmssAppServiceBase, IPersonnelAppService
    {
        private readonly IRepository<MstHrOrgStructure, Guid> _mstMstHrOrgStructureRepository;
        private readonly IRepository<User, long> _userRepository;
        private readonly IRepository<MstTitles, long> _mstTitlesRepository;
        private readonly IRepository<MstPosition, long> _posRepo;

        public PersonnelAppService(
           IRepository<MstHrOrgStructure, Guid> mstMstHrOrgStructureRepository,
           IRepository<User, long> userRepository,
           IRepository<MstTitles, long> mstTitlesRepository,
           IRepository<MstPosition, long> posRepo
           )
        {
            _mstMstHrOrgStructureRepository = mstMstHrOrgStructureRepository;
            _userRepository = userRepository;
            _mstTitlesRepository = mstTitlesRepository;
            _posRepo = posRepo;
        }

        [AbpAuthorize(AppPermissions.PersonnelMaster_Search)]
        public async Task<PagedResultDto<MstHrOrgStructureOutputSelectDto>> GetAllHrOrgStructure(MstHrOrgStructureInputSearchDto hrOrgStructureInputSearchDto)
        {
            var listHrOrg = from hrOrg in _mstMstHrOrgStructureRepository.GetAll().AsNoTracking()
                            join user in _userRepository.GetAll()
                            .Where(e => string.IsNullOrWhiteSpace(hrOrgStructureInputSearchDto.PersionalName) || e.Name.Contains(hrOrgStructureInputSearchDto.PersionalName))
                            on hrOrg.Id equals user.HrOrgStructureId
                            where ((string.IsNullOrWhiteSpace(hrOrgStructureInputSearchDto.Name) || hrOrg.Name.Contains(hrOrgStructureInputSearchDto.Name)) && hrOrg.Published==1)
                            select new MstHrOrgStructureOutputSelectDto()
                            {
                                Id = hrOrg.Id,
                                Name = hrOrg.Name,
                                Description = hrOrg.Description,
                                OrgStructureTypeName = hrOrg.OrgStructureTypeName,
                                OrgStructureTypeCode = hrOrg.OrgStructureTypeCode,
                            };

            var result = listHrOrg.Skip(hrOrgStructureInputSearchDto.SkipCount).Take(hrOrgStructureInputSearchDto.MaxResultCount);
            return new PagedResultDto<MstHrOrgStructureOutputSelectDto>(
            listHrOrg.Count(),
            result.ToList()
                      );
        }

        [AbpAuthorize(AppPermissions.PersonnelMaster_Search)]
        public async Task<PagedResultDto<PersonnelOutputSelectDto>> GetAllPersonnelByHrOrgStructureId(PersonnelInputSearchDto personnelInputSearchDto)
        {
            var listPersonnel = from personnel in _userRepository.GetAll().AsNoTracking()
                                join title in _mstTitlesRepository.GetAll().AsNoTracking()
                                on personnel.TitlesId equals title.Id
                                join p in _posRepo.GetAll().AsNoTracking() on personnel.PositionId equals p.Id into k
                                from p in k.DefaultIfEmpty()
                                where (personnel.HrOrgStructureId == personnelInputSearchDto.HrOrgStructureId
                                && personnel.HrOrgStructureId != null && (string.IsNullOrWhiteSpace(personnelInputSearchDto.Name) || personnel.Name.Contains(personnelInputSearchDto.Name)))
                                select new PersonnelOutputSelectDto()
                                {
                                    Id = personnel.Id,
                                    Name = personnel.Name,
                                    EmailAddress = personnel.EmailAddress,
                                    EmployeesCode = personnel.EmployeeCode,
                                    Title = title.Name,
                                    Position = p.PositionName,
                                    Status = personnel.IsActive ? AppConsts.Active : AppConsts.InActive
                                };

            var result = listPersonnel.Skip(personnelInputSearchDto.SkipCount).Take(personnelInputSearchDto.MaxResultCount);
            return new PagedResultDto<PersonnelOutputSelectDto>(
            listPersonnel.Count(),
            result.ToList()
                      );
        }
    }
}
