using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.UnitOfMeasure.Dto;
using tmss.Personnel.Dto;

namespace tmss.Personnel
{
    public interface IPersonnelAppService: IApplicationService
    {
        Task<PagedResultDto<MstHrOrgStructureOutputSelectDto>> GetAllHrOrgStructure(MstHrOrgStructureInputSearchDto hrOrgStructureInputSearchDto);
        Task<PagedResultDto<PersonnelOutputSelectDto>> GetAllPersonnelByHrOrgStructureId(PersonnelInputSearchDto personnelInputSearchDto);
    }
}
