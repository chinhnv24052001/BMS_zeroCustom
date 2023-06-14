using Abp.Dependency;
using System;
using System.Collections.Generic;
using System.Text;
using tmss.Master.InventoryItems.Dto;

namespace tmss.Master.InventoryItemPrices
{
    public interface IImpInventoryItemPriceDataReader : ITransientDependency
    {
        List<ImpInventoryItemPriceDto> GetInventoryItemPriceDataFromExcel(byte[] fileBytes);
    }
}
