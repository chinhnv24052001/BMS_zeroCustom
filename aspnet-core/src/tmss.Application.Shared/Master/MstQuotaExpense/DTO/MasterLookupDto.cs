using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.Master.MstQuotaExpense.DTO
{
    public class MasterLookupDto
    {
        public int Id { get; set; }
        public Guid StringId { get; set; }
        public string Code { get; set; }
        public string ContractAppendixNo { get; set; }
        public string Name { get; set; }
    }
}
