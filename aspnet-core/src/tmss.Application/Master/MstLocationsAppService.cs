using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Categories.Dto;
using tmss.Master.LineType.Dto;
using tmss.Master.Locations;
using tmss.Master.Locations.Dto;

namespace tmss.Master
{
    public class MstLocationsAppService : tmssAppServiceBase, IMstLocationsAppService
    {
        private readonly IRepository<MstLocations, long> _mstLocationsRepository;
        public MstLocationsAppService(IRepository<MstLocations, long> mstLocationsRepository)
        {
            _mstLocationsRepository = mstLocationsRepository;
        }
        public async Task<List<GetMstLocationsDto>> getAllLocations(SearchLocationDto searchLocationDto)
        {
            var listLocations = from locations in _mstLocationsRepository.GetAll().AsNoTracking()
            where (string.IsNullOrWhiteSpace(searchLocationDto.LocationCode) || locations.LocationCode.Contains(searchLocationDto.LocationCode))
            select new GetMstLocationsDto()
            {
                                    Id = locations.Id,
                                    Language = locations.Language,
                                    LocationCode = locations.LocationCode,
                                    SourceLanguage = locations.SourceLanguage,
                                    Description = locations.Description
                                };
            return listLocations.ToList();
        }

        public async Task<GetMstLocationsDto> getLocationById(long id)
        {
            var listLocations = from locations in _mstLocationsRepository.GetAll().AsNoTracking()
                                where locations.Id == id
                                select new GetMstLocationsDto()
                                {
                                    Id = locations.Id,
                                    Language = locations.Language,
                                    LocationCode = locations.LocationCode,
                                    SourceLanguage = locations.SourceLanguage,
                                    Description = locations.Description
                                };
            return listLocations.FirstOrDefault();
        }
    }
}
