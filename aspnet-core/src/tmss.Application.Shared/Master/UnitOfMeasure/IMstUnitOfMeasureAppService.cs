using Abp.Application.Services;
using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.PurchasePurpose.Dto;
using tmss.Master.UnitOfMeasure.Dto;

namespace tmss.Master.UnitOfMeasure
{
    public interface IMstUnitOfMeasureAppService: IApplicationService
    {
        Task<PagedResultDto<UnitOfMeasureDto>> getAllMeasureDto(UnitOfMeasureInputSearchDto unitOfMeasureInputSearchDto);
        Task<List<UnitOfMeasureDto>> getAllUmoNotPaged(SearchUnitOfMeasureNotPagedDto searchUnitOfMeasureNotPagedDto);
        Task<ValInventoryGroupDto> Save(UnitOfMeasureDto unitOfMeasureDto);
        Task Delete(long id);
        Task<UnitOfMeasureDto> LoadById(long id);
        Task<byte[]> MstOUMExportExcel(InputUOMExportDto input);
    }
}
