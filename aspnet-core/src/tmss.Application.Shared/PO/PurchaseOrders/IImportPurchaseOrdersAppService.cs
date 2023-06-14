using Abp.Application.Services;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.PO.PurchaseOrders.Dto;
using tmss.PR.PurchasingRequest.Dto;

namespace tmss.PO.PurchaseOrders
{
    public interface IImportPurchaseOrdersAppService : IApplicationService
    {
        Task<List<PoImportPurchaseOrderDto>> GetImportPoFromExcel(byte[] data);
    }
}
