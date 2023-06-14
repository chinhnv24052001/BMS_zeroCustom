﻿using System.Threading.Tasks;
using Abp.Application.Services;

namespace tmss.MultiTenancy
{
    public interface ISubscriptionAppService : IApplicationService
    {
        Task DisableRecurringPayments();

        Task EnableRecurringPayments();
    }
}
