using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.RequestApproval.Dto
{
    public class ApproveOrRejectOutputDto
    {
        /// <summary>
        /// Người cuối cùng approve hay reject
        /// </summary>
        public bool IsLast { get; set; }

        public bool Status { get; set; }
    }
}
