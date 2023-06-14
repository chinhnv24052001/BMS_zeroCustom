using Abp.Application.Services.Dto;
using System;
using System.ComponentModel.DataAnnotations;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllDocument : EntityDto<long>
    {  
        public string DocumentCode { get; set; }
        public string DocumentName { get; set; }
        public string ProcessTypeName { get; set; }
        public long? ProcessTypeId { get; set; }
        public int? IsIrregular { get; set; }
        public string ProductGroupName { get; set; }
        public long? InventoryGroupId { get; set; }
        public int? Leadtime { get; set; }
        public string Status { get; set; }
    }
}
