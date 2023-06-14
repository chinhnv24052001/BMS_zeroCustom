using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.LineType.Dto;
using tmss.Master.Locations.Dto;

namespace tmss.Master.Locations
{
    public interface IMstLocationsAppService : IApplicationService
    {
        Task<List<GetMstLocationsDto>> getAllLocations(SearchLocationDto searchLocationDto);
        Task<GetMstLocationsDto> getLocationById(long id);
    }
}
