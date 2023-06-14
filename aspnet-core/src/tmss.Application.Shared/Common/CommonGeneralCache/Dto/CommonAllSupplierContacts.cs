using Abp.Application.Services.Dto;
using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Common.CommonGeneralCache.Dto
{
    public class CommonAllSupplierContacts : EntityDto<long>
    {
        public long? SupplierSiteId { get; set; }
        public string FirstName { get; set; }
        public string MidName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
    }
}
