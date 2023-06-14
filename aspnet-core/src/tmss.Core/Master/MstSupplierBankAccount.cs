using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master
{
    public class MstSupplierBankAccount : FullAuditedEntity<long>, IEntity<long>
    {
        public long? SupplierId { get; set; }
        public long? SupplierSiteId { get; set; }
        public long? CurrencyId { get; set; }
        public byte IsPrimary { get; set; }
        public string BankName { get; set; }
        public string BankAccountName { get; set; }
        public string BankAccountNum { get; set; }

    }
}
