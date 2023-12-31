USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_InvGetPOByVendor]    Script Date: 4/20/2023 2:58:15 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_InvGetPOByVendor]
(
  @p_vendor_id BIGINT,
  @p_remove_id NVARCHAR(MAX)
)
AS 
BEGIN
	SELECT 
		a.*
		,ISNULL(a.QuantityReceived, QuantityOrder) - ISNULL(remainPO.Quantity,0) Quantity
		,ISNULL(remainPO.Quantity,0) QtyInvoice
		,remainPO.UnitPrice AS InvoicePrice
	FROM (
	SELECT
		ph.Segment1 PONumber
		,MAX(ph.CreationTime) CreationTime
		,ph.Comments
		,ms.SupplierName
		,ph.CurrencyCode
		,pl.UnitPrice
		,SUM(pl.Quantity) QuantityOrder
		,pl.CategoryId
		,pl.ItemDescription
		,CASE WHEN ISNULL(items.Color, '') = '' THEN items.PartNo ELSE CONCAT(items.PartNo, '.', items.Color) END AS ItemNumber
		,items.PartNameSupplier
		,MAX(pl.LineNum) LineNum
		,pl.PoHeaderId
		,pl.ItemId
		,SUM(rsl.QuantityReceived) QuantityReceived
		,CASE WHEN ISNULL(items.Color, '') = '' THEN items.PartNo ELSE items.PartNo + '.' + items.Color END AS PartNo
		,ph.VendorId
		,items.PartName
	FROM PoHeaders ph
	INNER JOIN MstSuppliers ms ON ms.Id = ph.VendorId
	INNER JOIN PoLines pl ON ph.Id = pl.PoHeaderId
	LEFT JOIN (
		SELECT
			SUM(QuantityReceived) AS QuantityReceived
			,ItemId
			,PoHeaderId
			,ItemDescription
		FROM RcvShipmentLines
		GROUP BY ItemId, PoHeaderId, ItemDescription
	) rsl ON rsl.PoHeaderId = ph.Id AND CONCAT(ISNULL(rsl.ItemId, 0), rsl.ItemDescription) = CONCAT(ISNULL(pl.ItemId, 0), pl.ItemDescription)
	LEFT JOIN MstInventoryItems items ON items.Id = pl.ItemId AND items.OrganizationId = 84
	WHERE ph.AuthorizationStatus ='APPROVED' AND ph.VendorId = @p_vendor_id                       
	AND(@p_remove_id IS NULL OR	 CHARINDEX(',' + cast(REPLACE(REPLACE(CONCAT(pl.PoHeaderId,pl.ItemDescription), ' ', ''), ',', '')   AS NVARCHAR(MAX)) + ',', ',' +  @p_remove_id + ',') = 0)
	GROUP BY ph.Segment1,ph.Comments, ms.SupplierName, ph.CurrencyCode, pl.UnitPrice, pl.CategoryId, items.PartName, items.PartNo, items.Color, items.PartNameSupplier,
			 pl.PoHeaderId, pl.ItemId, ph.VendorId, pl.ItemDescription) a
	LEFT JOIN
	(
	  SELECT 
			invLines.PoHeaderId
			,invLines.ItemId
			,SUM(invLines.Quantity) Quantity
			,invLines.UnitPrice
	  FROM InvoiceLines invLines
	  INNER JOIN InvoiceHeaders invHeaders  ON invLines.InvoiceId = invHeaders.Id
	  WHERE invHeaders.VendorId = @p_vendor_id
	  GROUP BY invLines.PoHeaderId, invLines.ItemId, invLines.UnitPrice
	) remainPO ON a.PoHeaderId = remainPO.PoHeaderId AND remainPO.ItemId = a.ItemId
	WHERE (ISNULL(a.QuantityReceived, QuantityOrder) - ISNULL(remainPO.Quantity, 0)) > 0
	ORDER BY a.CreationTime DESC
END;
