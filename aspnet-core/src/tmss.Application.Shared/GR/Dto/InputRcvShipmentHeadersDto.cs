using Abp.Domain.Entities.Auditing;
using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.GR.Dto
{
    public class InputRcvShipmentHeadersDto : PagedAndSortedInputDto
    {
        public long Id { get; set; }
        public string ReceiptSourceCode { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public long? OrganizationId { get; set; }
        public string ShipmentNum { get; set; }
        public string ReceiptNum { get; set; }
        public string BillOfLading { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public DateTime? ShippedDate { get; set; }
        public long? EmployeeId { get; set; }
        public string WaybillAirbillNum { get; set; }
        public string Comments { get; set; }
        public long? ShipToOrgId { get; set; }

        public string VendorName { get; set; }
        public string VendorSiteCode { get; set; }
        public long? EmployeeId2 { get; set; }
        public int ReceiptType { get; set; } //0: Receipt, 1: Acceptance 
        public DateTime? ServiceStartDate { get; set; }
        public DateTime? ServiceEndDate { get; set; }
        public string DeliverName1 { get; set; }
        public string DeliverTitle1 { get; set; }
        public string DeliverName2 { get; set; }
        public string DeliverTitle2 { get; set; }
        public int Status { get; set; }
        public string EmployeeName1 { get; set; }
        public string EmployeeName2 { get; set; }
        public string EmployeeTitle1 { get; set; }
        public string EmployeeTitle2 { get; set; }
        public string AuthorizationStatus { get; set; }
        public long? InventoryGroupId { get; set; }
        public long? DocumentId { get; set; }
        public string DocumentName { get; set; }
        public bool IsInventory { get; set; }

        public int TotalCount;
        //  public List<InputRcvShipmentLinesDto> InputRcvShipmentLinesDto { get; set; }
        public List<GetRcvReceiptNoteLineForEditDto> InputRcvShipmentLinesDto { get; set; }
        public List<RcvShipmentAttachmentsDto> Attachments { get; set; }

    }
}
