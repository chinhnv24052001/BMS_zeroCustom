using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization.Users;
using tmss.Master.ApprovalTree.Dto;
using tmss.Master.HrOrgStructure;
using tmss.Master.HrOrgStructure.Dto;

namespace tmss.Master
{
    public class MstHrOrgStructureAppService : tmssAppServiceBase, IMstHrOrgStructureAppService
    {
        private readonly IRepository<MstHrOrgStructure, Guid> _mstHrOrgStructureRepository;
        private readonly IRepository<User, long> _userRepository;

        public MstHrOrgStructureAppService(IRepository<MstHrOrgStructure, Guid> _mstHrOrgStructureRepository, IRepository<User, long> _userRepository)
        {
            this._mstHrOrgStructureRepository = _mstHrOrgStructureRepository;
            this._userRepository = _userRepository;
        }
        public List<MstHrOrgStructureOutputDto> GetAllActive()
        {
            List<MstHrOrgStructureOutputDto> mstHrOrgStructureOutputDtos = _mstHrOrgStructureRepository.GetAll().Select(p =>
                    new MstHrOrgStructureOutputDto()
                    {
                        Id = p.Id.ToString(),
                        HrOrgStructureName = p.Name
                    }
                ).ToList();
            return mstHrOrgStructureOutputDtos;
        }

        public List<MstHrOrgStructureEmployeeOutputDto> GetUserByHrOrgStructureId()
        {
            List<MstHrOrgStructureEmployeeOutputDto> mstHrOrgStructureEmployeeOutputDtos = _userRepository.GetAll()
                .Where(p => string.IsNullOrEmpty( p.HrOrgStructureId.ToString())== false ).AsNoTracking().Select(p =>
                  new MstHrOrgStructureEmployeeOutputDto
                  {
                      Id = p.Id,
                      EmployeeName = p.Name,
                      HrOrgStructureId = p.HrOrgStructureId,
                  }
                ).ToList();
            return mstHrOrgStructureEmployeeOutputDtos;
        }

        //Get list user group dropdown by HrOrg and title
        public async Task<List<UserSearchByHrOgrDto>> GetListUserByHrOrg(string HrOrgId, long positionId)
        {
            var listUser = from user in _userRepository.GetAll().AsNoTracking()
                           where ((string.IsNullOrWhiteSpace(HrOrgId) || new Guid(HrOrgId) == user.HrOrgStructureId)
                           && (positionId == 0 || positionId == user.PositionId))
                           select new UserSearchByHrOgrDto
                           {
                               Id = user.Id,
                               UserName = user.Name + "(" + user.UserName + ")",
                           };
            return listUser.ToList();
        }
    }
}
