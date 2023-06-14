﻿using System;
using System.Collections.Generic;
using System.Text;
using tmss.Dto;

namespace tmss.GR.Dto
{
    public class GetRcvReceiptNoteLineForEditDto : PagedAndSortedInputDto
    {
        public long Id { get; set; }
        public bool Checked { get; set; }
        public int? LineNum { get; set; }
        public long? CategoryId { get; set; }
        public decimal? QuantityShipped { get; set; }
        public decimal? QuantityReceived { get; set; }
       
        public string UnitOfMeasure { get; set; }
        public string ItemDescription { get; set; }
        public long? ItemId { get; set; }
        public string ItemRevision { get; set; }
        public string ShipmentLineStatusCode { get; set; }
        public string SourceDocumentCode { get; set; }
        public long? PoHeaderId { get; set; }
        public long? PoLineId { get; set; }
        public long? PoLineShipmentId { get; set; }
        public long? PoDistributionId { get; set; }
        public long? RoutingHeaderId { get; set; }
        public long? DeliverToPersonId { get; set; }
        public long? EmployeeId { get; set; }
        public string DestinationTypeCode { get; set; }
        public long? ToOrganizationId { get; set; }
        public string ToSubinventory { get; set; }
        public long? LocatorId { get; set; }
        public long? DeliverToLocationId { get; set; }
        public long? RequestId { get; set; }
        public string PrimaryUnitOfMeasure { get; set; }
        public string AsnLineFlag { get; set; }
        public long? ShipToLocationId { get; set; }
        public string CountryOfOriginCode { get; set; }
        public decimal? SecondaryQuantityReceived { get; set; }
        public decimal? AmountReceived { get; set; }

        public long? ReceiptNoteHeaderId { get; set; }
        public long? ReceiptNoteLineId { get; set; }

        public decimal? QuantityOrdered { get; set; }
        public decimal? QuantityAccumulated { get; set; }
        public decimal? QuantityRemained { get; set; }
        public decimal? QuantityAvailable { get; set; }


        public string PoNo { get; set; }
        public string VendorName { get; set; }
        public string VendorSiteCode { get; set; }
        public DateTime? NeedByDate { get; set; }
        public string PoTypeLookupCode { get; set; }
        public string Destination { get; set; }
        public string ReceivingRoutingDesc { get; set; }
        public string CategoryDesc { get; set; }
        public string PartNo { get; set; }
        public long? InventoryGroupId { get; set; }
        public bool IsManuallyAdded { get; set; }
        public string ProductGroupName { get; set; }
        public bool IsInventory { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public DateTime? FinishedDate { get; set; }
        public string Remark { get; set; }
    }
}
