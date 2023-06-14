using Abp.Dependency;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.ImportExcel.Bms.Segment.Dto;
using tmss.ImportExcel.PurchasePurpose.Dto;

namespace tmss.ImportExcel.Bms.Segment
{
    public interface ISegmentExcelAppService : ITransientDependency
    {
        Task<List<SegmentReadDataDto>> GetListSegmentFromExcel(byte[] fileBytes, string fileName, string segNum);
    }
}
