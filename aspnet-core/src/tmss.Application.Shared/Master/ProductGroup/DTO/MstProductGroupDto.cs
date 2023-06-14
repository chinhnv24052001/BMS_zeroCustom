using System;

namespace tmss.Master.Dto
{
    public class MstProductGroupDto
    {
        public long Id { get; set; }
        public string ProductGroupCode { get; set; }
        public string ProductGroupName { get; set; }
        public string ParentGroupName { get; set; }
        public long? ParentId { get; set; }
        public string Status { get; set; }
    }
}
