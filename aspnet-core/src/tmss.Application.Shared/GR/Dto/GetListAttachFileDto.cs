using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;

namespace tmss.GR.Dto
{
    public class GetListAttachFileDto : EntityDto<long?>
    {
        public long? ClaimId { get; set; }
        [StringLength(1024)]
        public string AttachFile { get; set; }
        [StringLength(512)]
        public string AttachName { get; set; }
        public long? AttachSize { get; set; }
    }
}
