using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Core.Master.Period;
using tmss.Master.Period.Dto;

namespace tmss.Master.Period
{
    public class MstPeriodAppService : tmssAppServiceBase, IMstPeriod
    {
        private readonly IRepository<MstPeriod, long> _mstPeriodRepository;
        
        public MstPeriodAppService(IRepository<MstPeriod, long> mstPeriodRepository)
        {
            _mstPeriodRepository = mstPeriodRepository;
        }

        public async Task<bool> CheckGlDate(DateTime glDate)
        {
            if(glDate != null)
            {
                MstPeriod mstPeriod = await _mstPeriodRepository.FirstOrDefaultAsync(p => p.IsActive == true && p.FromDate.Date <= glDate.Date && p.Todate.Date >= glDate.Date);
                if(mstPeriod != null)
                {
                    return true;
                } else
                {
                    return false;
                }
            } else
            {
                return false;
            }
            
        }

        public async Task<List<ListPeriodDto>> GetAllPeriodNoPage()
        {
            var listPeriod = from period in _mstPeriodRepository.GetAll()
                             select new ListPeriodDto
                             {
                                 Id = period.Id,
                                 PeriodName = period.PeriodName,
                             };
            return listPeriod.ToList();
        }

        public async Task<PagedResultDto<ListPeriodDto>> LoadAllPeriod(InputSearchMstPeriodDto input)
        {
            var listPeriod = from period in _mstPeriodRepository.GetAll()
                             select new ListPeriodDto
                             {
                                 Id = period.Id,
                                 PeriodName = period.PeriodName,
                                 FromDate = period.FromDate,
                                 Todate = period.Todate,
                                 Description = period.Description
                             };
            var result = listPeriod.Skip(input.SkipCount).Take(input.MaxResultCount);
            return new PagedResultDto<ListPeriodDto>(
                listPeriod.Count(),
                result.ToList()
               );
        }
    }
}
