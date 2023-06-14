using Abp.Application.Services.Dto;
using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.Period.Dto;
using tmss.Master.Currency.Dto;

namespace tmss.Master.Currency
{
    public interface IMstCurrency: IApplicationService
    {
        Task<PagedResultDto<MstCurrencySelectDto>> LoadAllCurrency(InputSearchMstCurrency inputSearchMstCurrency);

        Task<List<LoadAllOutputDto>> LoadAll(bool hasAll);
    }
}
