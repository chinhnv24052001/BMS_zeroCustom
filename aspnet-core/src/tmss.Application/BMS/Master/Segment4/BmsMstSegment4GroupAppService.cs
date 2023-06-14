using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment2;
using tmss.BMS.Master.Segment2.Dto;
using tmss.BMS.Master.Segment4;
using tmss.BMS.Master.Segment4.Dto;
using tmss.Core.BMS.Master.Period;

namespace tmss.BMS.Master.BmsSegment4
{
    public class BmsMstSegment4GroupAppService : tmssAppServiceBase, IBmsMstSegment4GroupAppService
    {
        private readonly IRepository<BmsMstSegment4Group, long> _mstBmsMstSegment4GroupRepository;
        private readonly IRepository<BmsMstPeriod, long> _mstPeriodRepository;
        public BmsMstSegment4GroupAppService(IRepository<BmsMstSegment4Group, long> mstBmsMstSegment4GroupRepository,
            IRepository<BmsMstPeriod, long> mstPeriodRepository)
        {
            _mstBmsMstSegment4GroupRepository = mstBmsMstSegment4GroupRepository;
            _mstPeriodRepository = mstPeriodRepository;
        }

        public async Task Delete(long id)
        {
            BmsMstSegment4Group bmsMstSegment4Group = _mstBmsMstSegment4GroupRepository.Load(id);
            if (bmsMstSegment4Group != null)
            {
                await _mstBmsMstSegment4GroupRepository.DeleteAsync(id);
            }
        }

        public async Task<PagedResultDto<MstSegment4GroupDto>> getAllSegment4Group(SearchSegment4GroupDto searchSegment4GroupDto)
        {
            var group4Enum = from group4 in _mstBmsMstSegment4GroupRepository.GetAll().AsNoTracking()
                             join period in _mstPeriodRepository.GetAll().AsNoTracking()
                             on group4.PeriodId equals period.Id
                                  where ((searchSegment4GroupDto.PeriodId == 0 || group4.PeriodId == searchSegment4GroupDto.PeriodId)
                                  && (string.IsNullOrWhiteSpace(searchSegment4GroupDto.GroupName) || group4.GroupName.Contains(searchSegment4GroupDto.GroupName)))
                                  select new MstSegment4GroupDto
                                  {
                                      Id = group4.Id,
                                      GroupName = group4.GroupName,
                                      Decription = group4.Decription,
                                      PeriodName = period.PeriodName
                                  };
            var result = group4Enum.Skip(searchSegment4GroupDto.SkipCount).Take(searchSegment4GroupDto.MaxResultCount);
            return new PagedResultDto<MstSegment4GroupDto>(
                       group4Enum.Count(),
                       result.ToList()
                      );
        }

        public async Task<List<MstSegment4GroupDto>>  GetListSegment4Groups()
        {
            var listProjectType = from group4 in _mstBmsMstSegment4GroupRepository.GetAll().AsNoTracking()
                                  select new MstSegment4GroupDto
                                  {
                                      Id = group4.Id,
                                      GroupName = group4.GroupName,
                                      Decription = group4.Decription,
                                  };
            return listProjectType.ToList();
        }

        public async Task<InputSegment4GroupDto> LoadById(long id)
        {
            var group4Enum = from group4 in _mstBmsMstSegment4GroupRepository.GetAll().AsNoTracking()
                             where (group4.Id == id)
                             select new InputSegment4GroupDto
                             {
                                 Id = group4.Id,
                                 GroupName = group4.GroupName,
                                 Decription = group4.Decription,
                                 PeriodId = group4.PeriodId
                             };
            return group4Enum.FirstOrDefault();
        }

        public async Task<ValSegment4Dto> Save(InputSegment4GroupDto inputSegment4GroupDto)
        {
            ValSegment4Dto result = new ValSegment4Dto();
            if (inputSegment4GroupDto.Id == 0)
            {
                //Check duplicate for create
                var project = await _mstBmsMstSegment4GroupRepository.FirstOrDefaultAsync(e => e.GroupName.Equals(inputSegment4GroupDto.GroupName));
                result.Name = project != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputSegment4GroupDto);
                }
            }
            else
            {
                //Check duplicate for edit
                var project = await _mstBmsMstSegment4GroupRepository.FirstOrDefaultAsync(e => e.GroupName.Equals(inputSegment4GroupDto.GroupName) && e.Id != inputSegment4GroupDto.Id);
                result.Name = project != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputSegment4GroupDto);
                }
            }
            return result;
        }

        private async Task Create(InputSegment4GroupDto inputSegment4GroupDto)
        {
            BmsMstSegment4Group bmsMstSegment4Group = new BmsMstSegment4Group();
            bmsMstSegment4Group.PeriodId = inputSegment4GroupDto.PeriodId;
            bmsMstSegment4Group.Decription = inputSegment4GroupDto.Decription;
            bmsMstSegment4Group.GroupName = inputSegment4GroupDto.GroupName;
            await _mstBmsMstSegment4GroupRepository.InsertAsync(bmsMstSegment4Group);
        }

        private async Task Update(InputSegment4GroupDto inputSegment4GroupDto)
        {
            BmsMstSegment4Group bmsMstSegment4Group = await _mstBmsMstSegment4GroupRepository.FirstOrDefaultAsync(p => p.Id == inputSegment4GroupDto.Id);
            bmsMstSegment4Group.PeriodId = inputSegment4GroupDto.PeriodId;
            bmsMstSegment4Group.Decription = inputSegment4GroupDto.Decription;
            bmsMstSegment4Group.GroupName = inputSegment4GroupDto.GroupName;
            await _mstBmsMstSegment4GroupRepository.UpdateAsync(bmsMstSegment4Group);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
