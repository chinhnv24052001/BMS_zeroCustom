using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.BMS.Master.PairingSegment;
using tmss.BMS.Master.PairingSegment.Dto;
using tmss.BMS.Master.Period;
using tmss.BMS.Master.Segment1;
using tmss.BMS.Master.Segment1.Dto;
using tmss.BMS.Master.Segment2;
using tmss.BMS.Master.Segment3;
using tmss.BMS.Master.Segment3.Dto;
using tmss.BMS.Master.Segment4;
using tmss.BMS.Master.Segment5;
using tmss.BMS.Master.UserControl;
using tmss.Core.BMS.Master.Period;
using tmss.ImportExcel.Bms.Segment.Dto;
using tmss.Master.BMS.Department;

namespace tmss.BMS.Master.BmsPairingSegment
{
    public class BmsMstPairingSegmentAppService : tmssAppServiceBase, IBmsMstPairingSegmentAppService
    {
        private readonly IRepository<BmsBudgetPlan, long> _bmsMstPairingSegmentRepository;
        private readonly IRepository<BmsMstSegment1, long> _mstSegment1Repository;
        private readonly IRepository<BmsMstSegment2, long> _mstSegment2Repository;
        private readonly IRepository<BmsMstSegment3, long> _mstSegment3Repository;
        private readonly IRepository<BmsMstSegment4, long> _mstSegment4Repository;
        private readonly IRepository<BmsMstSegment5, long> _mstSegment5Repository;
        private readonly IRepository<BmsMstPeriod, long> _mstBmsPeriodRepository;
        private readonly IRepository<BmsMstPeriodVersion, long> _bmsMstPeriodVersionRepository;
        private readonly IRepository<BmsMstDepartment, long> _mstDepartmentRepository;
        private readonly IRepository<BmsBudgetUserControl, long> _bmsBudgetUserControlRepository;
        private readonly IRepository<BmsMstVersion, long> _bmsMstVersionRepository;
        public BmsMstPairingSegmentAppService(
            IRepository<BmsBudgetPlan, long> bmsMstPairingSegmentRepository,
            IRepository<BmsMstSegment1, long> mstSegment1Repository,
            IRepository<BmsMstSegment2, long> mstSegment2Repository,
            IRepository<BmsMstSegment3, long> mstSegment3Repository,
            IRepository<BmsMstSegment4, long> mstSegment4Repository,
            IRepository<BmsMstSegment5, long> mstSegment5Repository,
            IRepository<BmsMstPeriod, long> mstBmsPeriodRepository,
            IRepository<BmsMstPeriodVersion, long> bmsMstPeriodVersionRepository,
            IRepository<BmsMstDepartment, long> mstDepartmentRepository,
            IRepository<BmsBudgetUserControl, long> bmsBudgetUserControlRepository,
             IRepository<BmsMstVersion, long> bmsMstVersionRepository
            )
        {
            _bmsMstPairingSegmentRepository = bmsMstPairingSegmentRepository;
            _mstSegment1Repository = mstSegment1Repository;
            _mstSegment2Repository= mstSegment2Repository; 
            _mstSegment3Repository= mstSegment3Repository;
            _mstSegment4Repository= mstSegment4Repository;
            _mstSegment5Repository= mstSegment5Repository;
            _mstBmsPeriodRepository= mstBmsPeriodRepository;
            _bmsMstPeriodVersionRepository = bmsMstPeriodVersionRepository;
            _mstDepartmentRepository = mstDepartmentRepository;
            _bmsBudgetUserControlRepository= bmsBudgetUserControlRepository;
            _bmsMstVersionRepository = bmsMstVersionRepository;
        }

        public async Task Delete(long id)
        {
            BmsBudgetPlan bmsMstPairingSegment = _bmsMstPairingSegmentRepository.Load(id);
            if (bmsMstPairingSegment != null)
            {
                await _bmsMstPairingSegmentRepository.DeleteAsync(id);
            }
        }

        public async Task<PagedResultDto<BmsMstPairingSegmentDto>> getAllPairingSegment(SearchPairingDto searchPairingDto)
        {
            var pairingEnum = from pairing in _bmsMstPairingSegmentRepository.GetAll().AsNoTracking()
                              join segment1 in _mstSegment1Repository.GetAll().AsNoTracking()
                              on pairing.Segment1Id equals segment1.Id

                              join segment2 in _mstSegment2Repository.GetAll().AsNoTracking()
                              on pairing.Segment2Id equals segment2.Id

                              join segment3 in _mstSegment3Repository.GetAll().AsNoTracking()
                               on pairing.Segment3Id equals segment3.Id

                              join segment4 in _mstSegment4Repository.GetAll().AsNoTracking()
                              on pairing.Segment4Id equals segment4.Id

                              join segment5 in _mstSegment5Repository.GetAll().AsNoTracking()
                               on pairing.Segment5Id equals segment5.Id

                              join version in _bmsMstPeriodVersionRepository.GetAll().AsNoTracking()
                              on pairing.PeriodVersion equals version.Id

                              join mstVersion in _bmsMstVersionRepository.GetAll().AsNoTracking()
                               on version.VersionId equals mstVersion.Id

                              join period in _mstBmsPeriodRepository.GetAll().AsNoTracking()
                              on version.PeriodId equals period.Id

                              where (string.IsNullOrWhiteSpace(searchPairingDto.FillterText)
                              || segment1.Name.Contains(searchPairingDto.FillterText)
                              || segment2.Name.Contains(searchPairingDto.FillterText)
                              || segment3.Name.Contains(searchPairingDto.FillterText)
                              || segment4.Name.Contains(searchPairingDto.FillterText)
                              || segment5.Name.Contains(searchPairingDto.FillterText))
                              select new BmsMstPairingSegmentDto
                              {
                                  Id = pairing.Id,
                                  Segment1Name = segment1.Name,
                                  Segment2Name = segment2.Name,
                                  Segment3Name = segment3.Name,
                                  Segment4Name = segment4.Name,
                                  Segment5Name = segment5.Name,
                                  PairingText = pairing.BudgetCode,
                                  Description = pairing.Description,
                                  IsActive = pairing.IsActive,
                                  PeriodVersionName = mstVersion.VersionName,
                                  PeriodName = period.PeriodName,
                                  Name = pairing.ActivitiesName,
                                  AmountTransfer = pairing.AmountTransfer,
                                  Type = pairing.Type == 1 ? "Expense" : "Investment"
                               };

        var result = pairingEnum.Skip(searchPairingDto.SkipCount).Take(searchPairingDto.MaxResultCount);
            return new PagedResultDto<BmsMstPairingSegmentDto>(
                       pairingEnum.Count(),
                       result.ToList()
                      );
        }

        public async Task<InputPairingSegmentDto> LoadById(long id)
        {
            var pairingEnum = from pairing in _bmsMstPairingSegmentRepository.GetAll().AsNoTracking()
                              where (pairing.Id == id)
                              select new InputPairingSegmentDto
                              {
                                  Id = pairing.Id,
                                  Segment1Id = pairing.Segment1Id,
                                  Segment2Id = pairing.Segment2Id,
                                  Segment3Id = pairing.Segment3Id,
                                  Segment4Id = pairing.Segment4Id,
                                  Segment5Id = pairing.Segment5Id,
                                  PairingText = pairing.BudgetCode,
                                  Description = pairing.Description,
                                  IsActive = pairing.IsActive,
                                  PeriodId = pairing.PeriodId,
                                  PeriodVersion = pairing.PeriodVersion,
                                  Name = pairing.ActivitiesName,
                                  AmountTransfer = pairing.AmountTransfer,
                                  Type = pairing.Type,
                              };
            return pairingEnum.FirstOrDefault();
        }

        public async Task<ValPairingSegmentDto> Save(InputPairingSegmentDto inputPairingSegmentDto)
        {
            ValPairingSegmentDto result = new ValPairingSegmentDto();
            if (inputPairingSegmentDto.Id == 0)
            {
                //Check duplicate for create
                var pairing = await _bmsMstPairingSegmentRepository.FirstOrDefaultAsync(e =>e.PeriodVersion == inputPairingSegmentDto.PeriodVersion && e.BudgetCode.Equals(inputPairingSegmentDto.PairingText));
                result.Name = pairing != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputPairingSegmentDto);
                }
            }
            else
            {
                //Check duplicate for edit
                var typeCost = await _bmsMstPairingSegmentRepository.FirstOrDefaultAsync(e => e.PeriodVersion == inputPairingSegmentDto.PeriodVersion && e.BudgetCode.Equals(inputPairingSegmentDto.PairingText) && e.Id != inputPairingSegmentDto.Id);
                result.Name = typeCost != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputPairingSegmentDto);
                }
            }
            return result;
        }

        private async Task Create(InputPairingSegmentDto inputPairingSegmentDto)
        {
            BmsBudgetPlan bmsMstPairingSegment = new BmsBudgetPlan();
            bmsMstPairingSegment.Segment1Id = inputPairingSegmentDto.Segment1Id;
            bmsMstPairingSegment.Segment2Id = inputPairingSegmentDto.Segment2Id;
            bmsMstPairingSegment.Segment3Id = inputPairingSegmentDto.Segment3Id;
            bmsMstPairingSegment.Segment4Id = inputPairingSegmentDto.Segment4Id;
            bmsMstPairingSegment.Segment5Id = inputPairingSegmentDto.Segment5Id;
            bmsMstPairingSegment.PeriodVersion = inputPairingSegmentDto.PeriodVersion;
            bmsMstPairingSegment.PeriodId = inputPairingSegmentDto.PeriodId;
            bmsMstPairingSegment.BudgetCode = inputPairingSegmentDto.PairingText;
            bmsMstPairingSegment.ActivitiesName = inputPairingSegmentDto.Name;
            bmsMstPairingSegment.IsActive = inputPairingSegmentDto.IsActive;
            bmsMstPairingSegment.Description = inputPairingSegmentDto.Description;
            bmsMstPairingSegment.Type = inputPairingSegmentDto.Type;

            bmsMstPairingSegment.AmountTransfer = 0;
            bmsMstPairingSegment.TransferBudgetId = 0;

            await _bmsMstPairingSegmentRepository.InsertAsync(bmsMstPairingSegment);
        }

        private async Task Update(InputPairingSegmentDto inputPairingSegmentDto)
        {
            BmsBudgetPlan bmsMstPairingSegment = await _bmsMstPairingSegmentRepository.FirstOrDefaultAsync(p => p.Id == inputPairingSegmentDto.Id);
            bmsMstPairingSegment.Segment1Id = inputPairingSegmentDto.Segment1Id;
            bmsMstPairingSegment.Segment2Id = inputPairingSegmentDto.Segment2Id;
            bmsMstPairingSegment.Segment3Id = inputPairingSegmentDto.Segment3Id;
            bmsMstPairingSegment.Segment4Id = inputPairingSegmentDto.Segment4Id;
            bmsMstPairingSegment.Segment5Id = inputPairingSegmentDto.Segment5Id;
            bmsMstPairingSegment.PeriodId = inputPairingSegmentDto.PeriodId;
            bmsMstPairingSegment.PeriodVersion = inputPairingSegmentDto.PeriodVersion;
            bmsMstPairingSegment.BudgetCode = inputPairingSegmentDto.PairingText;
            bmsMstPairingSegment.ActivitiesName = inputPairingSegmentDto.Name;
            bmsMstPairingSegment.IsActive = inputPairingSegmentDto.IsActive;
            bmsMstPairingSegment.Description = inputPairingSegmentDto.Description;
            bmsMstPairingSegment.Type = inputPairingSegmentDto.Type;

            await _bmsMstPairingSegmentRepository.UpdateAsync(bmsMstPairingSegment);
            await CurrentUnitOfWork.SaveChangesAsync();
        }

        public async Task<List<BmsMstPairingSegmentDto>> getAllPairingSegmentNoPage()
        {
            var pairingEnum = from pairing in _bmsMstPairingSegmentRepository.GetAll().AsNoTracking()
                              where pairing.IsActive == true
                              select new BmsMstPairingSegmentDto
                              {
                                  Id = pairing.Id,
                                  PairingText = pairing.BudgetCode,
                                  Name = pairing.ActivitiesName
                              };

            return pairingEnum.ToList();
        }

        //dasda
        public async Task<List<BmsMstPairingSegmentDto>> gatAllBugetPlanForUserControl()
        {
            var userId = AbpSession.UserId;
            var pairingEnum = from pairing in _bmsMstPairingSegmentRepository.GetAll().AsNoTracking()
                              join bdUser in _bmsBudgetUserControlRepository.GetAll().AsNoTracking()
                              on pairing.Segment3Id equals bdUser.BudgetId
                              where bdUser.UserId == userId && bdUser.ManageType == 0
                              select new BmsMstPairingSegmentDto
                              {
                                  Id = pairing.Id,
                                  PairingText = pairing.BudgetCode,
                                  Name = pairing.ActivitiesName
                              };
            return pairingEnum.ToList();
        }

        public async Task<DepartmentSelectDto> getDepartmentInfoByBudgetPlan(long id)
        {
            var departmentEnum = from budget in _bmsMstPairingSegmentRepository.GetAll().AsNoTracking()
                                 join segment3 in _mstSegment3Repository.GetAll().AsNoTracking()
                                 on budget.Segment3Id equals segment3.Id
                                 join department in _mstDepartmentRepository.GetAll().AsNoTracking()
                                 on segment3.DepartmentId equals department.Id
                                 where budget.Id == id
                                 select new DepartmentSelectDto
                                 {
                                     Id = department.Id,
                                     Name = department.DepartmentName
                                 };

            return departmentEnum.FirstOrDefault();
        }

        public async Task SaveAllImport(List<SegmentReadDataDto> listSegmentReadDataDto)
        {
            foreach (var seg in listSegmentReadDataDto)
            {
                InputPairingSegmentDto buggetPlan = new InputPairingSegmentDto();
                if(seg.type == 1)
                {
                    buggetPlan.PairingText = seg.segment1Code + "." + seg.segment2Code + "." + seg.segment3Code + "." + seg.segment4Code + seg.segment5Code;
                }
                else
                {
                    buggetPlan.PairingText = seg.segment1Code + "." + seg.segment2Code + "." + seg.segment3Code + "." + seg.segment4Code + "." + seg.segment5Code;
                }

                buggetPlan.Id = 0;
                buggetPlan.Segment1Id = seg.Segment1Id;
                buggetPlan.Segment2Id = seg.Segment2Id;
                buggetPlan.Segment3Id = seg.Segment3Id;
                buggetPlan.Segment4Id = seg.Segment4Id;
                buggetPlan.Segment5Id = seg.Segment5Id;

                buggetPlan.Name = seg.Name;
                buggetPlan.Description = seg.Description;
                buggetPlan.IsActive = seg.IsActive;
                buggetPlan.PeriodVersion = seg.PeriodVersion;
                buggetPlan.PeriodId = seg.PeriodId;
                buggetPlan.Type = seg.type;
                await Save(buggetPlan);
            }
        }
    }
}
