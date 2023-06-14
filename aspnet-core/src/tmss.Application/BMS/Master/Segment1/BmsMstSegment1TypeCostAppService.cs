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
using tmss.Core.Master.Period;
using tmss.Master.Period;

namespace tmss.BMS.Master.BmsSegment1
{
    public class BmsMstSegment1TypeCostAppService : tmssAppServiceBase, IBmsMstSegment1TypeCostAppService
    {

        private readonly IRepository<BmsMstSegment1TypeCost, long> _mstSegment1TypeCostRepository;

        public BmsMstSegment1TypeCostAppService(IRepository<BmsMstSegment1TypeCost, long> mstSegment1TypeCostRepository)
        {
            _mstSegment1TypeCostRepository = mstSegment1TypeCostRepository;
        }

        public async Task Delete(long id)
        {
            BmsMstSegment1TypeCost bmsMstSegment1TypeCost = _mstSegment1TypeCostRepository.Load(id);
            if (bmsMstSegment1TypeCost != null)
            {
                await _mstSegment1TypeCostRepository.DeleteAsync(id);
            }
        }

        public async Task<PagedResultDto<TypeCostDto>> getAllTypeCost(SearchTypeCostDto searchTypeCostDto)
        {
            var listTypeCode = from typeCost in _mstSegment1TypeCostRepository.GetAll().AsNoTracking()
                               where 
                               (string.IsNullOrWhiteSpace(searchTypeCostDto.TypeCostName) || typeCost.TypeCostName.Contains(searchTypeCostDto.TypeCostName))
                               select new TypeCostDto
                               {
                                   Id = typeCost.Id,
                                   TypeCostName = typeCost.TypeCostName,
                                   Description = typeCost.Description
                               };
            var result = listTypeCode.Skip(searchTypeCostDto.SkipCount).Take(searchTypeCostDto.MaxResultCount);
            return new PagedResultDto<TypeCostDto>(
                       listTypeCode.Count(),
                       result.ToList()
                      );
        }

        //Get to dropdown
        public List<MstSegment1TypeCostDto> GetListSegment1TypeCosts()
        {
            var listTypeCost = from typeCost in _mstSegment1TypeCostRepository.GetAll().AsNoTracking()
                               select new MstSegment1TypeCostDto
                               {
                                   Id = typeCost.Id,
                                   TypeCostName = typeCost.TypeCostName,
                                   Description = typeCost.Description
                               };
            return listTypeCost.ToList();
        }

        public async Task<InputTypeCostDto> LoadById(long id)
        {
            var typeCode = from typeCost in _mstSegment1TypeCostRepository.GetAll().AsNoTracking()
                               where typeCost.Id == id
                               select new InputTypeCostDto
                               {
                                   Id = typeCost.Id,
                                   TypeCostName = typeCost.TypeCostName,
                                   Description = typeCost.Description
                               };
            return typeCode.FirstOrDefault();
        }

        public async Task<ValSegment1SaveDto> Save(InputTypeCostDto inputTypeCostDto)
        {
            ValSegment1SaveDto result = new ValSegment1SaveDto();
            if (inputTypeCostDto.Id == 0)
            {
                //Check duplicate for create
                var typeCost = await _mstSegment1TypeCostRepository.FirstOrDefaultAsync(e => e.TypeCostName.Equals(inputTypeCostDto.TypeCostName));
                result.Name = typeCost != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Create(inputTypeCostDto);
                }
            }
            else
            {
                //Check duplicate for edit
                var typeCost = await _mstSegment1TypeCostRepository.FirstOrDefaultAsync(e => e.TypeCostName.Equals(inputTypeCostDto.TypeCostName) && e.Id != inputTypeCostDto.Id);
                result.Name = typeCost != null ? AppConsts.DUPLICATE_NAME : null;
                if (result.Name != null)
                {
                    return result;
                }
                else
                {
                    await Update(inputTypeCostDto);
                }
            }
            return result;
        }

        private async Task Create(InputTypeCostDto inputTypeCostDto)
        {
            BmsMstSegment1TypeCost bmsMstSegment1TypeCost = new BmsMstSegment1TypeCost();
            bmsMstSegment1TypeCost.TypeCostName = inputTypeCostDto.TypeCostName;
            bmsMstSegment1TypeCost.Description = inputTypeCostDto.Description;
            await _mstSegment1TypeCostRepository.InsertAsync(bmsMstSegment1TypeCost);
        }

        private async Task Update(InputTypeCostDto inputTypeCostDto)
        {
            BmsMstSegment1TypeCost bmsMstSegment1TypeCost = await _mstSegment1TypeCostRepository.FirstOrDefaultAsync(p => p.Id == inputTypeCostDto.Id);
            bmsMstSegment1TypeCost.TypeCostName = inputTypeCostDto.TypeCostName;
            bmsMstSegment1TypeCost.Description = inputTypeCostDto.Description;
            await _mstSegment1TypeCostRepository.UpdateAsync(bmsMstSegment1TypeCost);
            await CurrentUnitOfWork.SaveChangesAsync();
        }
    }
}
