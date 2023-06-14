using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.RequestApproval.Dto
{
    public class RequestNextApprovalTreeInputDto
    {
        //get set khong lap trinh tnay 

        //public long ReqId { get; set; }
        //public string ProcessTypeCode { get; set; }

        //public RequestNextApprovalTreeInputDto(long ReqId, string ProcessTypeCode)
        //{
        //    this.ReqId = ReqId;
        //    this.ProcessTypeCode = ProcessTypeCode;
        //}

        public long ReqId { get; set; }
        public string ProcessTypeCode { get; set; }
        public string DepartmentName { get; set; }
    }

}
