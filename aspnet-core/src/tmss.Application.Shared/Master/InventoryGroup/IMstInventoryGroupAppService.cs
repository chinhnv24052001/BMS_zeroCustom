using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.InventoryGroup.Dto;

namespace tmss.Master.InventoryGroup
{
    public interface IMstInventoryGroupAppService : IApplicationService
    {
        Task<List<GetMstInventoryGroupDto>> getAllInventoryGroup();
        Task<byte[]> MstInventoryGroupExportExcel(InputMstInventoryGroupExportDto input);
    }
}
