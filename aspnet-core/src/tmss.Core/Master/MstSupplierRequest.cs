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
    public class MstSupplierRequest : FullAuditedEntity<long>, IEntity<long>
    {
        public string SupplierName { get; set; }
        public string TaxRegistrationNumber { get; set; }
        public string Address { get; set; }
        public string Tel { get; set; }
        public string Tax { get; set; }
        public string ConntactPerson1 { get; set; }
        public string ContactEmail1 { get; set; }
        public string ContactMobile1 { get; set; }
        public string ConntactPerson2 { get; set; }
        public string ContactEmail2 { get; set; }
        public string ContactMobile2 { get; set; }
        public string ConntactPerson3 { get; set; }
        public string ContactEmail3 { get; set; }
        public string ContactMobile3 { get; set; }
        public string ClassificationType { get; set; }
        public string BeneficiaryName { get; set; }
        public string BeneficiaryAccount { get; set; }
        public string BankCode { get; set; }
        public string BankName { get; set; }
        public string BankBranch { get; set; }
        public string BankAddress { get; set; }
        public string RequestPerson { get; set; }
        public string RequestEmail { get; set; }
        public string Location { get; set; }
        public string TransferStatus { get; set; }
        public Guid RequestUniqueId { get; set; }
        public DateTime? RequestExpiredDate { get; set; }
        public long? NationId { get; set; }
        public long? ProvinceId { get; set; }
        public long? DistrictId { get; set; }
        public string AbbreviateName { get; set; }
        public string RepresentName { get; set; }
        public string ApprovalStatus { get; set; }
        public string RequestNo { get; set; }
        public string DepartmentApprovalName { get; set; }
        public long? CurrencyId { get; set; }


    }
}
