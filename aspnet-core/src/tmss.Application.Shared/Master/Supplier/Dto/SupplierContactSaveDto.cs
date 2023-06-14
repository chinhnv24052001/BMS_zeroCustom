using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.Supplier.Dto
{
    public class SupplierContactSaveDto
    {
        public long Id { get; set; }    
        public long SupplierSiteId { get; set; }
        public string SupplierName { get; set; }
        public string SupplierNumber { get; set; }
        public string SiteAddress { get; set; }
        public string FullName { get; set; }
        public string FirstName { get; set; }
        public string MidName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Password { get; set; }
        public string RePassword { get; set; }
        public string Phone { get; set; }
        public string EmailAddress { get; set; }
        public long? SupplierId { get; set; }
    }
}
