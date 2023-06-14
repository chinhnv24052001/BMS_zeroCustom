using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Threading.Tasks;
using tmss.BMS.Master.ExchangeRateMaster.Dto;
using tmss.BMS.Master.Period;
using tmss.BMS.Master.ProjectCode;
using tmss.BMS.Master.ProjectCode.Dto;
using tmss.BMS.Master.ProjectCode12;
using tmss.BMS.Master.Segment1;
using tmss.BMS.Master.Segment2;
using tmss.Core.BMS.Master.Period;
using System.Linq;
using tmss.BMS.Master.PairingSegment.Dto;
using tmss.BMS.Master.PairingSegment;

namespace tmss.BMS.Master.ProjectCode
{
    public class ProjectCodeAppService : tmssAppServiceBase, IProjectCodeAppService
    {
        private readonly IRepository<BmsMstPeriod, long> _mstBmsPeriodRepository;
        private readonly IRepository<BmsMstPeriodVersion, long> _bmsMstPeriodVersionRepository;
        private readonly IRepository<BmsMstSegment1, long> _bmsMstSegment1Repository;
        private readonly IRepository<BmsMstSegment2, long> _bmsMstSegment2Repository;
        private readonly IRepository<BmsMstProjectCode12, long> _bmsMstProjectCodeRepository;
        private readonly IRepository<BmsMstVersion, long> _bmsMstVersionRepository;

        public ProjectCodeAppService(
             IRepository<BmsMstPeriod, long> mstBmsPeriodRepository,
             IRepository<BmsMstPeriodVersion, long> bmsMstPeriodVersionRepository,
             IRepository<BmsMstSegment1, long> bmsMstSegment1Repository,
             IRepository<BmsMstSegment2, long> bmsMstSegment2Repository,
             IRepository<BmsMstProjectCode12, long> bmsMstProjectCodeRepository,
             IRepository<BmsMstVersion, long> bmsMstVersionRepository
            )
        {
            _mstBmsPeriodRepository = mstBmsPeriodRepository;
            _bmsMstPeriodVersionRepository = bmsMstPeriodVersionRepository;
            _bmsMstSegment1Repository = bmsMstSegment1Repository;
            _bmsMstSegment2Repository = bmsMstSegment2Repository;
            _bmsMstProjectCodeRepository = bmsMstProjectCodeRepository;
            _bmsMstVersionRepository = bmsMstVersionRepository;
        }

        public async Task Delete(long id)
        {
            BmsMstProjectCode12 bmsMstProjectCode12 = _bmsMstProjectCodeRepository.Load(id);
            if (bmsMstProjectCode12 != null)
            {
                await _bmsMstProjectCodeRepository.DeleteAsync(id);
            }
        }

        public async Task<PagedResultDto<BmsMstProjectCodeDto>> getAllProjectCode(SearchProjectCodeDto searchProjectCodeDto)
        {
            var projectCodeEnum = from project in _bmsMstProjectCodeRepository.GetAll().AsNoTracking()
                                  join version in _bmsMstPeriodVersionRepository.GetAll().AsNoTracking()
                                  on project.PeriodVersionId equals version.Id

                                  join mstVersion in _bmsMstVersionRepository.GetAll().AsNoTracking()
                                  on version.VersionId equals mstVersion.Id

                                  join period in _mstBmsPeriodRepository.GetAll().AsNoTracking()
                                  on version.PeriodId equals period.Id

                                  join seg1 in _bmsMstSegment1Repository.GetAll().AsNoTracking()
                                  on project.Segment1Id equals seg1.Id

                                  join seg2 in _bmsMstSegment2Repository.GetAll().AsNoTracking()
                                    on project.Segment2Id equals seg2.Id

                                  where ((string.IsNullOrWhiteSpace(searchProjectCodeDto.FillterText)
                                  || project.CodeProject.Contains(searchProjectCodeDto.FillterText)
                                  || seg1.Name.Contains(searchProjectCodeDto.FillterText)
                                  || seg2.Name.Contains(searchProjectCodeDto.FillterText))
                                  && (searchProjectCodeDto.PeriodId == 0 || project.PeriodId == searchProjectCodeDto.PeriodId))
                                  select new BmsMstProjectCodeDto
                                  {
                                      Id = project.Id,
                                      PeriodVersionName = mstVersion.VersionName,
                                      PeriodName = period.PeriodName,
                                      Segment1Name = seg1.Name,
                                      Segment2Name = seg2.Name,
                                      CodeProject = project.CodeProject
                                  };
            var result = projectCodeEnum.Skip(searchProjectCodeDto.SkipCount).Take(searchProjectCodeDto.MaxResultCount);
            return new PagedResultDto<BmsMstProjectCodeDto>(
                       projectCodeEnum.Count(),
                       result.ToList()
                      );
        }

        public async Task<InputProjectCodeDto> LoadById(long id)
        {
           var projectCodeEnum = from project in _bmsMstProjectCodeRepository.GetAll().AsNoTracking()
                              where project.Id == id
                              select new InputProjectCodeDto
                              {
                                  Id = project.Id,
                                  PeriodVersionId = project.PeriodVersionId,
                                  PeriodId = project.PeriodId,
                                  Segment1Id = project.Segment1Id,
                                  Segment2Id = project.Segment2Id,
                                  CodeProject = project.CodeProject,
                              };
            return projectCodeEnum.FirstOrDefault();
    }

        public async Task<ValProjectCodeDto> Save(InputProjectCodeDto inputProjectCodeDto)
        {
            ValProjectCodeDto result = new ValProjectCodeDto();
            if (inputProjectCodeDto.Id == 0)
            {
                //Check duplicate for create
                var pairing = await _bmsMstProjectCodeRepository.FirstOrDefaultAsync(e => e.PeriodVersionId == inputProjectCodeDto.PeriodVersionId && e.CodeProject.Equals(inputProjectCodeDto.CodeProject));
                result.Name = pairing != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputProjectCodeDto);
                }
            }
            else
            {
                //Check duplicate for edit
                var typeCost = await _bmsMstProjectCodeRepository.FirstOrDefaultAsync(e => e.PeriodVersionId == inputProjectCodeDto.PeriodVersionId && e.CodeProject.Equals(inputProjectCodeDto.CodeProject) && e.Id != inputProjectCodeDto.Id);
                result.Name = typeCost != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputProjectCodeDto);
                }
            }
            return result;
        }

        private async Task Create(InputProjectCodeDto inputProjectCodeDto)
        {
            BmsMstProjectCode12 bmsMstProjectCode12 = new BmsMstProjectCode12();
            bmsMstProjectCode12.PeriodVersionId = inputProjectCodeDto.PeriodVersionId;
            bmsMstProjectCode12.PeriodId = inputProjectCodeDto.PeriodId;
            bmsMstProjectCode12.Segment1Id = inputProjectCodeDto.Segment1Id;
            bmsMstProjectCode12.Segment2Id = inputProjectCodeDto.Segment2Id;
            bmsMstProjectCode12.CodeProject = inputProjectCodeDto.CodeProject;
            
            await _bmsMstProjectCodeRepository.InsertAsync(bmsMstProjectCode12);
        }

        private async Task Update(InputProjectCodeDto inputProjectCodeDto)
        {
            BmsMstProjectCode12 bmsMstProjectCode12 = await _bmsMstProjectCodeRepository.FirstOrDefaultAsync(p => p.Id == inputProjectCodeDto.Id);
            bmsMstProjectCode12.PeriodVersionId = inputProjectCodeDto.PeriodVersionId;
            bmsMstProjectCode12.PeriodId = inputProjectCodeDto.PeriodId;
            bmsMstProjectCode12.Segment1Id = inputProjectCodeDto.Segment1Id;
            bmsMstProjectCode12.Segment2Id = inputProjectCodeDto.Segment2Id;
            bmsMstProjectCode12.CodeProject = inputProjectCodeDto.CodeProject;
            await _bmsMstProjectCodeRepository.UpdateAsync(bmsMstProjectCode12);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task<ValProjectCodeMultipleSave> SaveMultiple(SaveMultipleProjectCodeDto saveMultipleProjectCodeDto)
        {
            var result = new ValProjectCodeMultipleSave();
            result.ValSeg1Required = false;
            result.ValSeg2Required = false;
            InputProjectCodeDto inputProjectCodeDto = new InputProjectCodeDto();
            if (saveMultipleProjectCodeDto.ListSegment1Id == null)
            {
                result.ValSeg1Required = true;
            }
            if(saveMultipleProjectCodeDto.ListSegment2Id == null)
            {
                result.ValSeg2Required = true;
            }

            if(result.ValSeg2Required == true || result.ValSeg1Required == true)
            {
                return result;
            }
            else
            {
                foreach (var seg1 in saveMultipleProjectCodeDto.ListSegment1Id)
                {
                    foreach (var seg2 in saveMultipleProjectCodeDto.ListSegment2Id)
                    {
                        inputProjectCodeDto = new InputProjectCodeDto();
                        inputProjectCodeDto.PeriodId = saveMultipleProjectCodeDto.PeriodId;
                        inputProjectCodeDto.PeriodVersionId = saveMultipleProjectCodeDto.PeriodVersionId;
                        inputProjectCodeDto.Segment1Id = seg1.Id;
                        inputProjectCodeDto.Segment2Id = seg2.Id;
                        inputProjectCodeDto.CodeProject = seg1.Code + "." + seg2.Code;
                       var saveResult = await Save(inputProjectCodeDto);
                    }
                }
            }
            return result;
        }
    }
}
