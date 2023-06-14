using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using DevExpress.XtraRichEdit.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment2.Dto;
using tmss.BMS.Master.Segment3;
using tmss.BMS.Master.Segment3.Dto;
using tmss.BMS.Master.Segment4.Dto;
using tmss.BMS.Master.Segment5;
using tmss.BMS.Master.Segment5.Dto;
using tmss.Core.BMS.Master.Period;
using tmss.Core.Master.Period;
using tmss.ImportExcel.Bms.Segment.Dto;
using tmss.Master;
using tmss.Master.BMS.Department;

namespace tmss.BMS.Master.BmsSegment5
{
    public class BmsMstSegment5AppService : tmssAppServiceBase, IBmsMstSegment5AppService
    {
        private readonly IRepository<BmsMstPeriod, long> _mstPeriodRepository;
        private readonly IRepository<BmsMstSegment5, long> _mstSegment5Repository;
        public BmsMstSegment5AppService(
            IRepository<BmsMstPeriod, long> mstPeriodRepository,
            IRepository<BmsMstSegment5, long> mstSegment5Repository
            )
        {
            _mstSegment5Repository = mstSegment5Repository;
            _mstPeriodRepository = mstPeriodRepository;
        }

        public async Task Delete(long id)
        {
            BmsMstSegment5 mstSegment5 = _mstSegment5Repository.Load(id);
            if (mstSegment5 != null)
            {
                await _mstSegment5Repository.DeleteAsync(id);
            }
        }

        public async Task<PagedResultDto<MstSegment5Dto>> getAllSegment5(SearchSegment5Dto input)
        {
            var listSegment3 = from segment5 in _mstSegment5Repository.GetAll().AsNoTracking()
                               join period in _mstPeriodRepository.GetAll().AsNoTracking()
                               on segment5.PeriodId equals period.Id
                               where ((input.PeriodId == 0 || segment5.PeriodId == input.PeriodId)
                               && (string.IsNullOrWhiteSpace(input.Code) || segment5.Code.Contains(input.Code))
                               && (string.IsNullOrWhiteSpace(input.Name) || segment5.Name.Contains(input.Name)))
                               select new MstSegment5Dto
                               {
                                   Id = segment5.Id,
                                   Code = segment5.Code,
                                   Name = segment5.Name,
                                   PeriodName = period.PeriodName,
                                   IsActive = segment5.IsActive,
                                   Description = segment5.Description
                               };
            var result = listSegment3.Skip(input.SkipCount).Take(input.MaxResultCount);
            return new PagedResultDto<MstSegment5Dto>(
                       listSegment3.Count(),
                       result.ToList()
                      );
        }

        public async Task<InputSegment5Dto> LoadById(long id)
        {
            var listSegment5 = from segment5 in _mstSegment5Repository.GetAll().AsNoTracking()
                               select new InputSegment5Dto
                               {
                                   Id = segment5.Id,
                                   Code = segment5.Code,
                                   Name = segment5.Name,
                                   PeriodId = segment5.PeriodId,
                                   IsActive = segment5.IsActive,
                                   Description = segment5.Description
                               };
            InputSegment5Dto inputSegment5Dto = listSegment5.FirstOrDefault();
            return inputSegment5Dto;
        }

        public async Task<ValSegment5Dto> Save(InputSegment5Dto inputSegment5Dto)
        {
            ValSegment5Dto result = new ValSegment5Dto();
            if (inputSegment5Dto.Id == 0)
            {
                //Check duplicate for create
                var segment = await _mstSegment5Repository.FirstOrDefaultAsync(e => e.Code.Equals(inputSegment5Dto.Code));
                result.Code = segment != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputSegment5Dto);
                }
            }
            else
            {
                //Check duplicate for edit
                var segment = await _mstSegment5Repository.FirstOrDefaultAsync(e => e.Code.Equals(inputSegment5Dto.Code) && e.Id != inputSegment5Dto.Id);
                result.Code = segment != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputSegment5Dto);
                }
            }
            return result;
        }

        private async Task Create(InputSegment5Dto input)
        {
            BmsMstSegment5 mstSegment5 = new BmsMstSegment5();
            mstSegment5 = ObjectMapper.Map<BmsMstSegment5>(input);
            await _mstSegment5Repository.InsertAsync(mstSegment5);
        }

        private async Task Update(InputSegment5Dto input)
        {
            BmsMstSegment5 mstSegment5 = await _mstSegment5Repository.FirstOrDefaultAsync(p => p.Id == input.Id);
            mstSegment5.PeriodId = input.PeriodId;
            mstSegment5.Code = input.Code;
            mstSegment5.Name = input.Name;
            mstSegment5.IsActive = input.IsActive;
            mstSegment5.Description = input.Description;
            await _mstSegment5Repository.UpdateAsync(mstSegment5);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task SaveAllImport(List<SegmentReadDataDto> listSegmentReadDataDto)
        {
            foreach (var seg in listSegmentReadDataDto)
            {
                InputSegment5Dto mstSegment5 = new InputSegment5Dto();
                mstSegment5.PeriodId = seg.PeriodId;
                mstSegment5.Code = seg.Code;
                mstSegment5.Name = seg.Name;
                mstSegment5.IsActive = seg.IsActive;
                mstSegment5.Description = seg.Description;
                await Create(mstSegment5);
            }
        }

        public async Task<List<MstSegment5Dto>> getAllSegment5NoPage()
        {
            var segment5Enum = from segment5 in _mstSegment5Repository.GetAll().AsNoTracking()
                               select new MstSegment5Dto
                               {
                                   Id = segment5.Id,
                                   Code = segment5.Code,
                                   Name = segment5.Name
                               };
            return segment5Enum.ToList();
        }
    }
}
