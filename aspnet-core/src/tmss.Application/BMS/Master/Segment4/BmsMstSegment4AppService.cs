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
using tmss.BMS.Master.Segment3.Dto;
using tmss.BMS.Master.Segment4;
using tmss.BMS.Master.Segment4.Dto;
using tmss.Core.BMS.Master.Period;
using tmss.Core.Master.Period;
using tmss.ImportExcel.Bms.Segment.Dto;

namespace tmss.BMS.Master.BmsSegment4
{
    public class BmsMstSegment4AppService : tmssAppServiceBase, IBmsMstSegment4AppService
    {

        private readonly IRepository<BmsMstPeriod, long> _mstPeriodRepository;  
        private readonly IRepository<BmsMstSegment4Group, long> _mstSegment4GroupRepository;
        private readonly IRepository<BmsMstSegment4, long> _mstSegment4Repository;
        public BmsMstSegment4AppService(
            IRepository<BmsMstPeriod, long> mstPeriodRepository,
            IRepository<BmsMstSegment4Group, long> mstSegment4GroupRepository,
            IRepository<BmsMstSegment4, long> mstSegment4Repository
            )
        {
            _mstPeriodRepository = mstPeriodRepository;
            _mstSegment4GroupRepository = mstSegment4GroupRepository;
            _mstSegment4Repository = mstSegment4Repository;
        }

        public async Task<PagedResultDto<MstSegment4Dto>> getAllSegment4(SearchSegment4Dto input)
        {
            var listSegment4 = from segment4Group in _mstSegment4GroupRepository.GetAll().AsNoTracking()
                               join segment4 in _mstSegment4Repository.GetAll().AsNoTracking()
                               on segment4Group.Id equals segment4.GroupSeg4Id
                               join period in _mstPeriodRepository.GetAll().AsNoTracking()
                               on segment4.PeriodId equals period.Id
                               where ((input.PeriodId == 0 || segment4.PeriodId == input.PeriodId)
                               && (string.IsNullOrWhiteSpace(input.Code) || segment4.Code.Contains(input.Code))
                               && (string.IsNullOrWhiteSpace(input.Name) || segment4.Name.Contains(input.Name)))
                               select new MstSegment4Dto
                               {
                                   Id = segment4.Id,
                                   Code = segment4.Code,
                                   Name = segment4.Name,
                                   PeriodName = period.PeriodName,
                                   GroupSeg4Name = segment4Group.GroupName,
                                   Description = segment4.Description
                               };
          
        var result = listSegment4.Skip(input.SkipCount).Take(input.MaxResultCount);
            return new PagedResultDto<MstSegment4Dto>(
                       listSegment4.Count(),
                       result.ToList()
                      );
        }

        public async Task<InputSegment4Dto> LoadById(long id)
        {
            var segment4ById = from segment4 in _mstSegment4Repository.GetAll().AsNoTracking()
                               select new InputSegment4Dto
                               {
                                   Id = segment4.Id,
                                   Code = segment4.Code,
                                   Name = segment4.Name,
                                   PeriodId = segment4.Id,
                                   GroupSeg4Id = segment4.Id,
                                   Description = segment4.Description
                               };
            return segment4ById.FirstOrDefault(); ;
        }

        public async Task<ValSegment4Dto> Save(InputSegment4Dto inputSegment4Dto)
        {
            ValSegment4Dto result = new ValSegment4Dto();
            if (inputSegment4Dto.Id == 0)
            {
                //Check duplicate for create
                var segment = await _mstSegment4Repository.FirstOrDefaultAsync(e => e.Code.Equals(inputSegment4Dto.Code));
                result.Code = segment != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputSegment4Dto);
                }
            }
            else
            {
                //Check duplicate for edit
                var segment = await _mstSegment4Repository.FirstOrDefaultAsync(e => e.Code.Equals(inputSegment4Dto.Code) && e.Id != inputSegment4Dto.Id);
                result.Code = segment != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputSegment4Dto);
                }
            }
            return result;
        }

        private async Task Create(InputSegment4Dto input)
        {
            BmsMstSegment4 mstSegment4 = new BmsMstSegment4();
            mstSegment4 = ObjectMapper.Map<BmsMstSegment4>(input);
            await _mstSegment4Repository.InsertAsync(mstSegment4);
        }

        private async Task Update(InputSegment4Dto input)
        {
            BmsMstSegment4 mstSegment4 = await _mstSegment4Repository.FirstOrDefaultAsync(p => p.Id == input.Id);
            mstSegment4.PeriodId = input.PeriodId;
            mstSegment4.GroupSeg4Id = input.GroupSeg4Id;
            mstSegment4.Code = input.Code;
            mstSegment4.Name = input.Name;
            mstSegment4.Description = input.Description;
            //mstCurExchangeRate = ObjectMapper.Map<MstCurExchangeRate>(input);
            await _mstSegment4Repository.UpdateAsync(mstSegment4);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task Delete(long id)
        {
            BmsMstSegment4 mstSegment4 = _mstSegment4Repository.Load(id);
            if (mstSegment4 != null)
            {
                await _mstSegment4Repository.DeleteAsync(id);
            }
        }

        public async Task SaveAllImport(List<SegmentReadDataDto> listSegmentReadDataDto)
        {
            foreach (var seg in listSegmentReadDataDto)
            {
                InputSegment4Dto mstSegment4 = new InputSegment4Dto();
                mstSegment4.PeriodId = seg.PeriodId;
                mstSegment4.GroupSeg4Id = seg.GroupSeg4Id;
                mstSegment4.Code = seg.Code;
                mstSegment4.Name = seg.Name;
                mstSegment4.Description = seg.Description;
                await Create(mstSegment4);
            }
        }

        public async Task<List<MstSegment4Dto>> getAllSegment4NoPage()
        {
            var segment4Enum = from segment4 in _mstSegment4Repository.GetAll().AsNoTracking()
                               select new MstSegment4Dto
                               {
                                   Id = segment4.Id,
                                   Code = segment4.Code,
                                   Name = segment4.Name
                               };
            return segment4Enum.ToList();
        }
    }
}
