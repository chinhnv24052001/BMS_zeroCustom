using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.Master.InventoryItemTemp
{
    public class ImpInventoryItemTemp : FullAuditedEntity<long>, IEntity<long>
    {

        public string ItemsCode { get; set; }  // Part Code
        public string PartNameSupplier { get; set; }  // Supplier Part Name
        public string ProductGroupName { get; set; }  // Iventory Group
        public long? InventoryItemId { get; set; }   
        public long? InventoryGroupId { get; set; }
        public long? CreatorUserId { get; set; }
        public string Remark { get; set; }
        public string ImageFileName { get; set; }   // Image
        public string ItemsName { get; set; }   // Part Name
        public string Color { get; set; }   // Color
        public string CurrencyCode { get; set; }   // Currency
        public string PrimaryUnitOfMeasure { get; set; }
        public long SupplierId { get; set; }
        public long CurrencyId { get; set; }
        public string PrimaryUomCode { get; set; }   // Unit of Measure
    }
}
