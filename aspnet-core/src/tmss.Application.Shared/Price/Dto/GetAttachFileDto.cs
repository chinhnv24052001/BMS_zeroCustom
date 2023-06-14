using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Price.Dto
{
    public class GetAttachFileDto : EntityDto<long>
    {
        public long HeaderId { get; set; }
        public string OriginalFileName { get; set; }
        public string ServerFileName { get; set; }
        public string RootPath { get; set; }
        public string AttachFileType { get; set; }
    }
}
