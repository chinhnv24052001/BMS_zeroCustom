using Abp.Application.Services;
using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment1;
using tmss.BMS.Master.Segment1.Dto;
using tmss.Core.BMS.Master.Period;
using tmss.Core.Master.Period;
using tmss.ImportExcel.Bms.Segment.Dto;
using tmss.ImportExcel.PurchasePurpose.Dto;
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.PurchasePurpose.Dto;
using tmss.Master.UnitOfMeasure.Dto;

namespace tmss.BMS.Master.BmsSegment1  
{
    public class BmsMstSegment1AppService : tmssAppServiceBase, IBmsMstSegment1AppService
    {
        private readonly IRepository<BmsMstSegment1TypeCost, long> _mstSegment1TypeCostRepository;
        private readonly IRepository<BmsMstSegment1, long> _mstSegment1Repository;
        private readonly IRepository<BmsMstPeriod, long> _mstPeriodRepository;
        public BmsMstSegment1AppService(
            IRepository<BmsMstSegment1TypeCost, long> mstSegment1TypeCostRepository,
            IRepository<BmsMstSegment1, long> mstSegment1Repository,
            IRepository<BmsMstPeriod, long> mstPeriodRepository
            )
        {
            _mstSegment1TypeCostRepository = mstSegment1TypeCostRepository;
            _mstSegment1Repository = mstSegment1Repository;
            _mstPeriodRepository = mstPeriodRepository;
        }

        public async Task Delete(long id)
        {
            BmsMstSegment1 mstSegment1 = _mstSegment1Repository.Load(id);
            if (mstSegment1 != null)
            {
                await _mstSegment1Repository.DeleteAsync(id);
            }
        }

        public async Task<PagedResultDto<MstSegment1Dto>> getAllSegment1(SearchSegment1Dto input)
        {
            var listSegment1 = from typeCost in _mstSegment1TypeCostRepository.GetAll().AsNoTracking()
                               join segment1 in _mstSegment1Repository.GetAll().AsNoTracking()
                               on typeCost.Id equals segment1.TypeCostId
                               join period in _mstPeriodRepository.GetAll().AsNoTracking()
                               on segment1.PeriodId equals period.Id
                               where ((input.PeriodId == 0 || segment1.PeriodId == input.PeriodId)
                               && (string.IsNullOrWhiteSpace(input.Code) || segment1.Code.Contains(input.Code))
                               && (string.IsNullOrWhiteSpace(input.Name) || segment1.Name.Contains(input.Name)))
                               select new MstSegment1Dto
                               {
                                   Id = segment1.Id,
                                   Code = segment1.Code,
                                   Name = segment1.Name,
                                   PeriodName = period.PeriodName,
                                   TypeCostName = typeCost.TypeCostName,
                                   Description = segment1.Description
                               };
            var result = listSegment1.Skip(input.SkipCount).Take(input.MaxResultCount);
            return new PagedResultDto<MstSegment1Dto>(
                       listSegment1.Count(),
                       result.ToList()
                      );
        }

        public async Task<InputSegment1Dto> LoadById(long id)
        {
            var segment1ById = from typeCost in _mstSegment1TypeCostRepository.GetAll().AsNoTracking()
                               join segment1 in _mstSegment1Repository.GetAll().AsNoTracking()
                               on typeCost.Id equals segment1.TypeCostId
                               join period in _mstPeriodRepository.GetAll().AsNoTracking()
                               on segment1.PeriodId equals period.Id
                               where segment1.Id == id
                               select new InputSegment1Dto
                               {
                                   Id = segment1.Id,
                                   Code = segment1.Code,
                                   Name = segment1.Name,
                                   PeriodId = period.Id,
                                   TypeCostId = typeCost.Id,
                                   Description = segment1.Description
                               };
            InputSegment1Dto inputSegment1Dto = segment1ById.FirstOrDefault();
            return inputSegment1Dto;
        }

        public async Task<ValSegment1SaveDto> Save(InputSegment1Dto inputSegment1Dto)
        {
            ValSegment1SaveDto result = new ValSegment1SaveDto();
            if (inputSegment1Dto.Id == 0)
            {
                //Check duplicate for create
                var segment1 = await _mstSegment1Repository.FirstOrDefaultAsync(e => e.Code.Equals(inputSegment1Dto.Code));
                result.Code = segment1 != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputSegment1Dto);
                }
            }
            else
            {
                //Check duplicate for edit
                var segment1 = await _mstSegment1Repository.FirstOrDefaultAsync(e => e.Code.Equals(inputSegment1Dto.Code) && e.Id != inputSegment1Dto.Id);
                result.Code = segment1 != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputSegment1Dto);
                }
            }
            return result;
        }

        private async Task Create(InputSegment1Dto input)
        {
            BmsMstSegment1 mstSegment1 = new BmsMstSegment1();
            mstSegment1 = ObjectMapper.Map<BmsMstSegment1>(input);
            await _mstSegment1Repository.InsertAsync(mstSegment1);
        }

        private async Task Update(InputSegment1Dto input)
        {
            BmsMstSegment1 mstSegment1 = await _mstSegment1Repository.FirstOrDefaultAsync(p => p.Id == input.Id);
            mstSegment1.PeriodId = input.PeriodId;
            mstSegment1.TypeCostId = input.TypeCostId;
            mstSegment1.Code = input.Code;
            mstSegment1.Name = input.Name;
            mstSegment1.Description = input.Description;
            //mstCurExchangeRate = ObjectMapper.Map<MstCurExchangeRate>(input);
            await _mstSegment1Repository.UpdateAsync(mstSegment1);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task SaveAllImport(List<SegmentReadDataDto> listSegmentReadDataDto)
        {
            foreach (var seg in listSegmentReadDataDto)
            {
                InputSegment1Dto mstSegment1 = new InputSegment1Dto();
                mstSegment1.PeriodId = seg.PeriodId;
                mstSegment1.TypeCostId = seg.TypeCostId;
                mstSegment1.Code = seg.Code;
                mstSegment1.Name = seg.Name;
                mstSegment1.Description = seg.Description;
                await Create(mstSegment1);
            }
        }

        public async Task<List<MstSegment1Dto>> getAllSegment1NoPage()
        {
            var segment1Enum = from segment1 in _mstSegment1Repository.GetAll().AsNoTracking()
                               select new MstSegment1Dto
                               {
                                   Id = segment1.Id,
                                   Code = segment1.Code,
                                   Name = segment1.Name
                               };
            return segment1Enum.ToList();
        }
    }
}
