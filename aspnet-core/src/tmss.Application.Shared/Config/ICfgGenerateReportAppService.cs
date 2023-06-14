using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using tmss.Config.Dto;

namespace tmss.Config
{
    public interface ICfgGenerateReportAppService
    {
        Task<byte[]> CreateReport(string ReportCode, object FieldDto);
    }
}
