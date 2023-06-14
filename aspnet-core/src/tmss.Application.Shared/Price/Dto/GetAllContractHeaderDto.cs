using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Price.Dto
{
    public class GetAllContractHeaderDto: EntityDto<long>
    {
        public string ContractNo { get; set; }
        public DateTime? EffectiveFrom { get; set; }

        public DateTime? EffectiveTo { get; set; }
        public string Description { get; set; }
        public string ApprovalStatus { get; set; }
        public string DepartmentApprovalName { get; set; }

        public int TotalCount { get; set; }
        public List<GetAttachFileDto> AttachFiles { get; set; }
        //public List<Att>
    }
}
