using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment1;
using tmss.BMS.Master.Segment1.Dto;
using tmss.BMS.Master.Segment2;
using tmss.BMS.Master.Segment2.Dto;

namespace tmss.BMS.Master.BmsSegment2
{
    public class BmsMstSegment2ProjectTypeAppService : tmssAppServiceBase, IBmsMstSegment2ProjectTypeAppService
    {
        private readonly IRepository<BmsMstSegment2ProjectType, long> _mstSegment2ProjectTypeRepository;
        public BmsMstSegment2ProjectTypeAppService(IRepository<BmsMstSegment2ProjectType, long> mstSegment2ProjectTypeRepository)
        {
            _mstSegment2ProjectTypeRepository = mstSegment2ProjectTypeRepository;
        }

        public async Task Delete(long id)
        {
            BmsMstSegment2ProjectType bmsMstSegment2ProjectType = _mstSegment2ProjectTypeRepository.Load(id);
            if (bmsMstSegment2ProjectType != null)
            {
                await _mstSegment2ProjectTypeRepository.DeleteAsync(id);
            }
        }

        public async Task<PagedResultDto<ProjectTypeDto>> getAllProjectType(SearchProjectTypeDto searchProjectTypeDto)
        {
            var projectTypeEnum = from projectType in _mstSegment2ProjectTypeRepository.GetAll().AsNoTracking()
                               where
                               (string.IsNullOrWhiteSpace(searchProjectTypeDto.ProjectTypeName) || searchProjectTypeDto.ProjectTypeName.Contains(searchProjectTypeDto.ProjectTypeName))
                               select new ProjectTypeDto
                               {
                                   Id = projectType.Id,
                                   ProjectTypeName = projectType.ProjectTypeName,
                                   Description = projectType.Description
                               };
            var result = projectTypeEnum.Skip(searchProjectTypeDto.SkipCount).Take(searchProjectTypeDto.MaxResultCount);
            return new PagedResultDto<ProjectTypeDto>(
                       projectTypeEnum.Count(),
                       result.ToList()
                      );
        }
 
        public  List<MstSegment2ProjectTypeDto> GetListSegment2ProjectTypes()
        {
            var listProjectType = from project in _mstSegment2ProjectTypeRepository.GetAll().AsNoTracking()
                               select new MstSegment2ProjectTypeDto
                               {
                                   Id = project.Id,
                                   ProjectTypeName = project.ProjectTypeName,
                                   Description = project.Description
                               };
            return listProjectType.ToList();
        }

        public async Task<InputProjectTypeDto> LoadById(long id)
        {
            var projectTypeEnum = from project in _mstSegment2ProjectTypeRepository.GetAll().AsNoTracking()
                                  select new InputProjectTypeDto
                                  {
                                      Id = project.Id,
                                      ProjectTypeName = project.ProjectTypeName,
                                      Description = project.Description
                                  };
            return projectTypeEnum.FirstOrDefault();
        }

        public async Task<ValSegment2Dto> Save(InputProjectTypeDto inputProjectTypeDto)
        {
            ValSegment2Dto result = new ValSegment2Dto();
            if (inputProjectTypeDto.Id == 0)
            {
                //Check duplicate for create
                var project = await _mstSegment2ProjectTypeRepository.FirstOrDefaultAsync(e => e.ProjectTypeName.Equals(inputProjectTypeDto.ProjectTypeName));
                result.Name = project != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputProjectTypeDto);
                }
            }
            else
            {
                //Check duplicate for edit
                var project = await _mstSegment2ProjectTypeRepository.FirstOrDefaultAsync(e => e.ProjectTypeName.Equals(inputProjectTypeDto.ProjectTypeName) && e.Id != inputProjectTypeDto.Id);
                result.Name = project != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputProjectTypeDto);
                }
            }
            return result;
        }

        private async Task Create(InputProjectTypeDto inputProjectTypeDto)
        {
            BmsMstSegment2ProjectType bmsMstSegment2ProjectType = new BmsMstSegment2ProjectType();
            bmsMstSegment2ProjectType.ProjectTypeName = inputProjectTypeDto.ProjectTypeName;
            bmsMstSegment2ProjectType.Description = inputProjectTypeDto.Description;
            await _mstSegment2ProjectTypeRepository.InsertAsync(bmsMstSegment2ProjectType);
        }

        private async Task Update(InputProjectTypeDto inputProjectTypeDto)
        {
            BmsMstSegment2ProjectType bmsMstSegment2ProjectType = await _mstSegment2ProjectTypeRepository.FirstOrDefaultAsync(p => p.Id == inputProjectTypeDto.Id);
            bmsMstSegment2ProjectType.ProjectTypeName = inputProjectTypeDto.ProjectTypeName;
            bmsMstSegment2ProjectType.Description = inputProjectTypeDto.Description;
            await _mstSegment2ProjectTypeRepository.UpdateAsync(bmsMstSegment2ProjectType);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

    }
}
