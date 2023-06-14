using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.RequestApproval.Dto
{
    public class FowardApproveInputDto
    {
        /// <summary>
        /// Bước duyệt hiện tại
        /// </summary>
        public long RequestApprovalStepId { get; set; }
        /// <summary>
        /// Người duyệt tiếp theo
        /// </summary>
        public long NextApproveUserId { get; set; }
 
        public string Note { get; set; }
        public bool IsLast { get; set; }
    }
}
