using Abp.Application.Services.Dto;
using System;

namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetAllUserRequestAttachmentsForViewDto : EntityDto<long>
    {
        public string FileName { get; set; }
        public string ServerFileName { get; set; }
        public string RootPath { get; set; }
        public DateTime UploadTime { get; set; }
        public bool OnSystem { get; set; }
    }
}
