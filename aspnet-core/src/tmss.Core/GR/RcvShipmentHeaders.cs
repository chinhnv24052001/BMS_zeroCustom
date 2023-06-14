﻿using Abp.Domain.Entities;
using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace tmss.GR
{
    public class RcvShipmentHeaders : FullAuditedEntity<long>, IEntity<long>
    {
        public string ReceiptSourceCode { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public long? OrganizationId { get; set; }
        public string ShipmentNum { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string ReceiptNum { get; set; }
        public string BillOfLading { get; set; }
        public DateTime? ShippedDate { get; set; }
        public long? EmployeeId { get; set; }
        public string WaybillAirbillNum { get; set; }
        public string Comments { get; set; }
        public long? ShipToOrgId { get; set; }
        public long? EmployeeId2 { get; set; }
        public int ReceiptType { get; set; } //0: Receipt, 1: Acceptance 
        public DateTime? ServiceStartDate { get; set; }
        public DateTime? ServiceEndDate { get; set; }
        public string DeliverName1 { get; set; }
        public string DeliverTitle1 { get; set; }
        public string DeliverName2 { get; set; }
        public string DeliverTitle2 { get; set; }
        public int Status { get; set; }
        public string AuthorizationStatus { get; set; }
        public string DepartmentApprovalName { get; set; }
        public long? InventoryGroupId { get; set; }
        public bool IsInventory { get; set; }
        public long? DocumentId { get; set; }
    }
}
