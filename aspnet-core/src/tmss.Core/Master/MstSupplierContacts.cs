using Abp.Domain.Entities.Auditing;
using Abp.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Abp;

namespace tmss.Master
{
    public class MstSupplierContacts : FullAuditedEntity<long>, IEntity<long>
    {
        public long? SupplierContactId { get; set; }
        public long? SupplierSiteId { get; set; }
        public long? SupplierId { get; set; }
        public string FirstName { get; set; }
        public string MidName { get; set; }
        public string LastName { get; set; }
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
