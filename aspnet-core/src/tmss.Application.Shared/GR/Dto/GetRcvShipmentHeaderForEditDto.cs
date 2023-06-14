using System;
using System.Collections.Generic;
using System.Text;

namespace tmss.GR.Dto
{
    public class GetRcvShipmentHeaderForEditDto
    {
        public long Id { get; set; }
        public string ReceiptSourceCode { get; set; }
        public long? VendorId { get; set; }
        public long? VendorSiteId { get; set; }
        public long? OrganizationId { get; set; }
        public string ShipmentNum { get; set; }
        public string ReceiptNum { get; set; }
        public DateTime? ReceivedDate { get; set; }
        public string BillOfLading { get; set; }
        public DateTime? ShippedDate { get; set; }
        public long? EmployeeId { get; set; }
        public string WaybillAirbillNum { get; set; }
        public string Comments { get; set; }
        public long? ShipToOrgId { get; set; }

        public List<GetRcvShipmentLineForEditDto> RcvShipmentLines { get; set; }
    }
}
