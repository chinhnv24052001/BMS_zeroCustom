USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_InvSearchInvoiceDetail]    Script Date: 4/25/2023 10:01:38 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_InvSearchInvoiceDetail]
(
	@p_invoiceId bigint,
	@p_status varchar(50)
)
AS
BEGIN
DECLARE @p_vendor_id BIGINT;

SELECT @p_vendor_id = ih.VendorId FROM  InvoiceHeaders ih WHERE ih.Id = @p_invoiceId;

SELECT
	A.*
	,ISNULL(a.QuantityGR, a.QuantityOrder) - ISNULL(currentInvoice.Quantity,0) + a.QuantityInv AS RemainQty
	,currentInvoice.Quantity AS QuantityPayment
	,ISNULL(a.QuantityGR, a.QuantityOrder) - ISNULL(currentInvoice.Quantity,0) AS RemainQtyActual
FROM (
SELECT  
		b.PoNumber
		,CASE WHEN ISNULL(INV.Color, '') = '' THEN INV.PartNo ELSE CONCAT(INV.PartNo, '.', INV.Color) END ItemNumber
		,b.ItemDescription
		,b.Quantity
		--,b.QuantityOrder
		,b.ForeignPrice AS ForeignPrice
		,b.QuantityReceived
		,b.QuantityMatched
		,0 ToVnd
		,0 VndPrice
		,b.Quantity * b.ForeignPrice Amount
		,b.InvoiceId
		,b.PoHeaderId
		,b.TaxRate
		,b.LineNum
		,b.Id
		,b.ItemId
		,SUM(pl.Quantity) QuantityOrder
		,b.Quantity QuantityInv
		,b.AmountVat
		,rsl.QuantityReceived QuantityGR
		,b.QuantityMatched QuantityPayment2
		,b.Quantity * b.ForeignPrice +  b.AmountVat TotalAmount
		,b.QuantityReceived - b.Quantity QtyRemainGR
		,b.Status
		,b.UnitPricePO
		,pl.ItemDescription ItemDescriptionPO
		,b.Note
       --,pl.Id AS PoId
FROM InvoiceLines b 
INNER JOIN InvoiceHeaders header ON b.InvoiceId = header.Id
LEFT JOIN PoLines pl ON b.PoHeaderId = pl.PoHeaderId AND b.ItemId = pl.ItemId
LEFT JOIN (
	SELECT
		SUM(QuantityReceived) AS QuantityReceived
		,ItemId
		,PoHeaderId
		,ItemDescription
	FROM RcvShipmentLines
	GROUP BY ItemId, PoHeaderId, ItemDescription
) rsl ON rsl.PoHeaderId = b.PoHeaderId AND (rsl.ItemId = pl.ItemId OR rsl.ItemDescription = pl.ItemDescription)
LEFT JOIN MstInventoryItems INV ON INV.Id = b.ItemId
WHERE b.InvoiceId = @p_invoiceId
AND b.IsDeleted = 0
AND header.IsDeleted = 0
AND (@p_status = '-1' or b.Status = @p_status)
GROUP BY b.PoNumber, b.ItemNumber, b.ItemDescription, 
       b.Quantity, b.QuantityOrder, b.ForeignPrice,
       b.QuantityReceived, b.QuantityMatched, b.Amount,
       b.InvoiceId, b.PoHeaderId, b.TaxRate, b.LineNum, b.Id,
       b.ItemId, b.AmountVat, b.Quantity, b.QuantityReceived,
       b.QuantityMatched, b.Status, b.UnitPricePO, pl.ItemDescription,
	   INV.Color, INV.PartNo, rsl.QuantityReceived, rsl.PoHeaderId, rsl.ItemId, b.Note
 ) a
LEFT JOIN 
(
	SELECT
		invLines.PoHeaderId
		,invLines.ItemId
		,SUM(invLines.QuantityMatched) Quantity
		,invLines.ItemDescription
	FROM InvoiceLines invLines
	INNER JOIN InvoiceHeaders invHeaders  ON invLines.InvoiceId = invHeaders.Id
	WHERE invHeaders.VendorId = @p_vendor_id AND invHeaders.Id = @p_invoiceId
	GROUP BY invLines.PoHeaderId, invLines.ItemId, invLines.ItemDescription
) currentInvoice ON a.PoHeaderId = currentInvoice.PoHeaderId
 AND currentInvoice.ItemId = a.ItemId
ORDER BY a.Status, InvoiceId DESC
END;
