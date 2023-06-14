using System;

namespace tmss.PR.PurchasingRequest.Dto
{
    public class GetRequesterDto
    {
        public long Id { get; set; }
        public string UserName { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public string Tel { get; set; }
        public string Title { get; set; }
        public Guid? DepartmentId { get; set; }
        public string Department { get; set; }
    }
}
