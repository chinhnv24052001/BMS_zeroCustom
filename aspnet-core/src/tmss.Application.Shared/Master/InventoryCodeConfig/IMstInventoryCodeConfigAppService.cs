using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.InventoryCodeConfig.Dto;

namespace tmss.Master.InventoryCodeConfig
{
    public interface IMstInventoryCodeConfigAppService : IApplicationService
    {
        Task<byte[]> MstInventoryCodeConfigExportExcel(InputSearchInventoryCodeConfigDto input);
    }
}
