using Abp.Application.Services;
using System.Collections.Generic;
using System.Threading.Tasks;
using tmss.ExcelDataReader.Dto;

namespace tmss.ExcelDataReader
{
    public interface IPcsUserRequestExcelDataReader : IApplicationService
    {
        Task<List<UserRequestExcelDataDto>> ReadDataFromExcel(byte[] files);
    }
}
