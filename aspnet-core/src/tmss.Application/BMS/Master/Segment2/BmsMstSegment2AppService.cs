using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment1.Dto;
using tmss.BMS.Master.Segment1;
using tmss.BMS.Master.Segment2;
using tmss.BMS.Master.Segment2.Dto;
using tmss.Core.Master.Period;
using tmss.Core.BMS.Master.Period;
using tmss.ImportExcel.Bms.Segment.Dto;

namespace tmss.BMS.Master.BmsSegment2
{
    public class BmsMstSegment2AppService : tmssAppServiceBase, IBmsMstSegment2AppService
    {

        private readonly IRepository<BmsMstPeriod, long> _mstPeriodRepository;  //Lay tu CPS
        private readonly IRepository<BmsMstSegment2ProjectType, long> _mstSegment2ProjectTypeRepository;
        private readonly IRepository<BmsMstSegment2, long> _mstSegment2Repository;
        public BmsMstSegment2AppService(
            IRepository<BmsMstPeriod, long> mstPeriodRepository, 
            IRepository<BmsMstSegment2ProjectType, long> mstSegment2ProjectTypeRepository, 
            IRepository<BmsMstSegment2, long> mstSegment2Repository
            )
        {
            _mstPeriodRepository = mstPeriodRepository;
            _mstSegment2ProjectTypeRepository = mstSegment2ProjectTypeRepository;
            _mstSegment2Repository = mstSegment2Repository;
        }

        public async Task<PagedResultDto<MstSegment2Dto>> getAllSegment2(SearchSegment2Dto input)
        {
            var listSegment2 = from projectType in _mstSegment2ProjectTypeRepository.GetAll().AsNoTracking()
                               join segment2 in _mstSegment2Repository.GetAll().AsNoTracking()
                               on projectType.Id equals segment2.ProjectTypeId
                               join period in _mstPeriodRepository.GetAll().AsNoTracking()
                               on segment2.PeriodId equals period.Id
                               where ((input.PeriodId == 0 || segment2.PeriodId == input.PeriodId)
                               && (string.IsNullOrWhiteSpace(input.Code) || segment2.Code.Contains(input.Code))
                               && (string.IsNullOrWhiteSpace(input.Name) || segment2.Name.Contains(input.Name)))
                               select new MstSegment2Dto
                               {
                                   Id = segment2.Id,
                                   Code = segment2.Code,
                                   Name = segment2.Name,
                                   PeriodName = period.PeriodName,
                                   ProjectTypeName = projectType.ProjectTypeName,
                                   Description = segment2.Description
                               };
            var result = listSegment2.Skip(input.SkipCount).Take(input.MaxResultCount);
            return new PagedResultDto<MstSegment2Dto>(
                       listSegment2.Count(),
                       result.ToList()
                      );
        }

        public async Task<InputSegment2Dto> LoadById(long id)
        {
            var segment2ById = from projectType in _mstSegment2ProjectTypeRepository.GetAll().AsNoTracking()
                               join segment2 in _mstSegment2Repository.GetAll().AsNoTracking()
                               on projectType.Id equals segment2.ProjectTypeId
                               join period in _mstPeriodRepository.GetAll().AsNoTracking()
                               on segment2.PeriodId equals period.Id
                               where segment2.Id == id
                               select new InputSegment2Dto
                               {
                                   Id = segment2.Id,
                                   Code = segment2.Code,
                                   Name = segment2.Name,
                                   PeriodId = period.Id,
                                   ProjectTypeId = projectType.Id,
                                   Description = segment2.Description
                               };
            InputSegment2Dto inputSegment2Dto = segment2ById.FirstOrDefault();
            return inputSegment2Dto;
        }

        public async Task<ValSegment2Dto> Save(InputSegment2Dto inputSegment2Dto)
        {
            ValSegment2Dto result = new ValSegment2Dto();
            if (inputSegment2Dto.Id == 0)
            {
                //Check duplicate for create
                var segment = await _mstSegment2Repository.FirstOrDefaultAsync(e => e.Code.Equals(inputSegment2Dto.Code));
                result.Code = segment != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputSegment2Dto);
                }
            }
            else
            {
                //Check duplicate for edit
                var segment = await _mstSegment2Repository.FirstOrDefaultAsync(e => e.Code.Equals(inputSegment2Dto.Code) && e.Id != inputSegment2Dto.Id);
                result.Code = segment != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputSegment2Dto);
                }
            }
            return result;
        }

        private async Task Create(InputSegment2Dto input)
        {
            BmsMstSegment2 mstSegment2 = new BmsMstSegment2();
            mstSegment2 = ObjectMapper.Map<BmsMstSegment2>(input);
            await _mstSegment2Repository.InsertAsync(mstSegment2);
        }

        private async Task Update(InputSegment2Dto input)
        {
            BmsMstSegment2 mstSegment2 = await _mstSegment2Repository.FirstOrDefaultAsync(p => p.Id == input.Id);
            mstSegment2.PeriodId = input.PeriodId;
            mstSegment2.ProjectTypeId = input.ProjectTypeId;
            mstSegment2.Code = input.Code;
            mstSegment2.Name = input.Name;
            mstSegment2.Description = input.Description;
            //mstCurExchangeRate = ObjectMapper.Map<MstCurExchangeRate>(input);
            await _mstSegment2Repository.UpdateAsync(mstSegment2);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task Delete(long id)
        {
            BmsMstSegment2 mstSegment2 = _mstSegment2Repository.Load(id);
            if (mstSegment2 != null)
            {
                await _mstSegment2Repository.DeleteAsync(id);
            }
        }

        public async Task SaveAllImport(List<SegmentReadDataDto> listSegmentReadDataDto)
        {
            foreach (var seg in listSegmentReadDataDto)
            {
                InputSegment2Dto mstSegment1 = new InputSegment2Dto();
                mstSegment1.PeriodId = seg.PeriodId;
                mstSegment1.ProjectTypeId = seg.ProjectTypeId;
                mstSegment1.Code = seg.Code;
                mstSegment1.Name = seg.Name;
                mstSegment1.Description = seg.Description;
                await Create(mstSegment1);
            }
        }

        public async Task<List<MstSegment2Dto>> getAllSegment2NoPage()
        {
            var segment2Enum = from segment2 in _mstSegment2Repository.GetAll().AsNoTracking()
                               select new MstSegment2Dto
                               {
                                   Id = segment2.Id,
                                   Code = segment2.Code,
                                   Name = segment2.Name
                               };
            return segment2Enum.ToList();
        }
    }
}
