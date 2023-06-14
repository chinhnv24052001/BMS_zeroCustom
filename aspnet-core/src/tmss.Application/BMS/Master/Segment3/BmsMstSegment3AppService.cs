using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.Segment2.Dto;
using tmss.BMS.Master.Segment3;
using tmss.BMS.Master.Segment3.Dto;
using tmss.Core.BMS.Master.Period;
using tmss.Core.Master.Period;
using tmss.ImportExcel.Bms.Segment.Dto;
using tmss.Master;
using tmss.Master.BMS.Department;

namespace tmss.BMS.Master.BmsSegment3
{
    public class BmsMstSegment3AppService : tmssAppServiceBase, IBmsMstSegment3AppService
    {
        private readonly IRepository<BmsMstDepartment, long> _mstDepartmentRepository;
        //private readonly IRepository<MstHrOrgStructure, Guid> _mstMstHrOrgStructureRepository;
        private readonly IRepository<BmsMstDivision, long> _mstDivisionRepository;
        private readonly IRepository<BmsMstPeriod, long> _mstPeriodRepository;
        private readonly IRepository<BmsMstSegment3, long> _mstSegment3Repository;
        public BmsMstSegment3AppService(
            IRepository<BmsMstDepartment, long> mstDepartmentRepository,
            IRepository<BmsMstDivision, long> mstDivisionRepository,
            IRepository<BmsMstPeriod, long> mstPeriodRepository,
            IRepository<BmsMstSegment3, long> mstSegment3Repository
            //IRepository<MstHrOrgStructure, Guid> mstMstHrOrgStructureRepository
            )
        {
            _mstDepartmentRepository = mstDepartmentRepository;
            _mstDivisionRepository = mstDivisionRepository;
            _mstPeriodRepository = mstPeriodRepository;
            _mstSegment3Repository = mstSegment3Repository;
        }

        public async Task Delete(long id)
        {
            BmsMstSegment3 mstSegment3 = _mstSegment3Repository.Load(id);
            if (mstSegment3 != null)
            {
                await _mstSegment3Repository.DeleteAsync(id);
            }
        }

        public async Task<List<DepartmentSelectDto>> GetAllDepartmentByDevisionNoPage(long divisionId)
        {
            var listDepartment = from department in _mstDepartmentRepository.GetAll().AsNoTracking()
                                 where department.DivisionId == divisionId
                                 select new DepartmentSelectDto
                                  {
                                      Id = department.Id,
                                      Name = department.DepartmentName
                                  };
            return listDepartment.ToList();
        }

        public async Task<List<DivisionSelectDto>> GetAllDivisionNoPage()
        {
            var listDivision = from division in _mstDivisionRepository.GetAll().AsNoTracking()
                               select new DivisionSelectDto
                               {
                                   Id = division.Id,
                                   Name = division.DivisionName
                               };
            return listDivision.ToList();
        }

        public async Task<PagedResultDto<MstSegment3Dto>> getAllSegment3(SearchSegment3Dto input)
        {
            var listSegment3 = from division in _mstDivisionRepository.GetAll().AsNoTracking()
                               join department in _mstDepartmentRepository.GetAll().AsNoTracking()
                               on division.Id equals department.DivisionId
                               join segment3 in _mstSegment3Repository.GetAll().AsNoTracking()
                               on department.Id equals segment3.DepartmentId
                               join period in _mstPeriodRepository.GetAll().AsNoTracking()
                               on segment3.PeriodId equals period.Id
                               where ((input.PeriodId == 0 || segment3.PeriodId == input.PeriodId)
                               && (string.IsNullOrWhiteSpace(input.Code) || segment3.Code.Contains(input.Code))
                               && (string.IsNullOrWhiteSpace(input.Name) || segment3.Name.Contains(input.Name)))
                               select new MstSegment3Dto
                               {
                                   Id = segment3.Id,
                                   Code = segment3.Code,
                                   Name = segment3.Name,
                                   PeriodName = period.PeriodName,
                                   DivisionName = division.DivisionName,
                                   DepartmentName = department.DepartmentName,
                                   Description = segment3.Description
                               };
            var result = listSegment3.Skip(input.SkipCount).Take(input.MaxResultCount);
            return new PagedResultDto<MstSegment3Dto>(
                       listSegment3.Count(),
                       result.ToList()
                      );
        }

        public async Task<InputSegment3Dto> LoadById(long id)
        {
            var listSegment3 = from division in _mstDivisionRepository.GetAll().AsNoTracking()
                               join department in _mstDepartmentRepository.GetAll().AsNoTracking()
                               on division.Id equals department.DivisionId
                               join segment3 in _mstSegment3Repository.GetAll().AsNoTracking()
                               on department.Id equals segment3.DepartmentId
                               join period in _mstPeriodRepository.GetAll().AsNoTracking()
                               on segment3.PeriodId equals period.Id
                               where segment3.Id == id
                               select new InputSegment3Dto
                               {
                                   Id = segment3.Id,
                                   Code = segment3.Code,
                                   Name = segment3.Name,
                                   PeriodId = period.Id,
                                   DivisionId = division.Id,
                                   DepartmentId = department.Id,
                                   Description = segment3.Description
                               };
            InputSegment3Dto inputSegment3Dto = listSegment3.FirstOrDefault();
            return inputSegment3Dto;
        }

        public async Task<ValSegment3Dto> Save(InputSegment3Dto inputSegment3Dto)
        {
            ValSegment3Dto result = new ValSegment3Dto();
            if (inputSegment3Dto.Id == 0)
            {
                //Check duplicate for create
                var segment = await _mstSegment3Repository.FirstOrDefaultAsync(e => e.Code.Equals(inputSegment3Dto.Code));
                result.Code = segment != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputSegment3Dto);
                }
            }
            else
            {
                //Check duplicate for edit
                var segment = await _mstSegment3Repository.FirstOrDefaultAsync(e => e.Code.Equals(inputSegment3Dto.Code) && e.Id != inputSegment3Dto.Id);
                result.Code = segment != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Code != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputSegment3Dto);
                }
            }
            return result;
        }

        private async Task Create(InputSegment3Dto input)
        {
            BmsMstSegment3 mstSegment3 = new BmsMstSegment3();
            mstSegment3 = ObjectMapper.Map<BmsMstSegment3>(input);
            await _mstSegment3Repository.InsertAsync(mstSegment3);
        }

        private async Task Update(InputSegment3Dto input)
        {
            BmsMstSegment3 mstSegment3 = await _mstSegment3Repository.FirstOrDefaultAsync(p => p.Id == input.Id);
            mstSegment3.PeriodId = input.PeriodId;
            mstSegment3.DivisionId = input.DivisionId;
            mstSegment3.DepartmentId = input.DepartmentId;
            mstSegment3.Code = input.Code;
            mstSegment3.Name = input.Name;
            mstSegment3.Description = input.Description;
            //mstCurExchangeRate = ObjectMapper.Map<MstCurExchangeRate>(input);
            await _mstSegment3Repository.UpdateAsync(mstSegment3);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task SaveAllImport(List<SegmentReadDataDto> listSegmentReadDataDto)
        {
            foreach (var seg in listSegmentReadDataDto)
            {
                InputSegment3Dto mstSegment3 = new InputSegment3Dto();
                mstSegment3.PeriodId = seg.PeriodId;
                mstSegment3.DivisionId = seg.DivisionId;
                mstSegment3.DepartmentId = seg.DepartmentId;
                mstSegment3.Code = seg.Code;
                mstSegment3.Name = seg.Name;
                mstSegment3.Description = seg.Description;
                await Create(mstSegment3);
            }
        }

        public async Task<List<MstSegment3Dto>> getAllSegment3NoPage()
        {
            var segment3Enum = from segment3 in _mstSegment3Repository.GetAll().AsNoTracking()
                               select new MstSegment3Dto
                               {
                                   Id = segment3.Id,
                                   Code = segment3.Code,
                                   Name = segment3.Name
                               };
            return segment3Enum.ToList();
        }
    }
}
