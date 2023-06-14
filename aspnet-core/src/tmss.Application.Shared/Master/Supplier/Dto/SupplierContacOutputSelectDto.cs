using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Supplier.Dto
{
    public class SupplierContacOutputSelectDto
    {
        public long Id { get; set; }
        public long? SupplierSiteId { get; set; }
        public string FullName { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string Prefix { get; set; }
        public string Title { get; set; }
        public string AreaCode { get; set; }
        public string Phone { get; set; }
        public DateTime? InactiveDate { get; set; }
        public bool? IsActive { get; set; }
        public string EmailAddress { get; set; }
    }
}
