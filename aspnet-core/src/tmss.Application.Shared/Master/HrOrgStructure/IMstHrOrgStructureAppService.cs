using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.ApprovalTree.Dto;
using tmss.Master.HrOrgStructure.Dto;

namespace tmss.Master.HrOrgStructure
{
    public interface IMstHrOrgStructureAppService
    {
        //Task<List<MstHrOrgStructureOutputDto>> GetAllActive( );

        //Task<List<MstHrOrgStructureEmployeeOutputDto>> GetUserByHrOrgStructureId(Guid HrOrgStructureId);
        Task<List<UserSearchByHrOgrDto>> GetListUserByHrOrg(string HrOrgId, long titleId);
    }
}
