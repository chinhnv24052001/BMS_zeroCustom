USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_PcsQueryPoLinesForUpdatePoInvoice]    Script Date: 4/11/2023 10:09:27 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_PcsQueryPoLinesForUpdatePoInvoice]
(
	@PoId BIGINT
)
WITH RECOMPILE
AS
BEGIN
	SELECT
		PO.Id
		,PO.Segment1 AS PoNumber
		,INV.Id AS ItemId
		,INV.PartName
		,INV.PartNameSupplier
		,CASE WHEN ISNULL(INV.Color, '') = '' THEN INV.PartNo ELSE CONCAT(INV.PartNo, '.', INV.Color) END AS PartNo
		,POL.UnitPrice
		,SUM(POL.Quantity) AS PoQuantity
		,SUM(RSL.QuantityReceived) QuantityGR
		,CAT.IsSkipInvCheck
	FROM PoHeaders PO
	INNER JOIN PoLines POL ON POL.PoHeaderId = PO.Id
	LEFT JOIN MstInventoryItems INV ON INV.Id = POL.ItemId AND PO.VendorId = INV.SupplierId
	LEFT JOIN (
		SELECT
			SUM(QuantityReceived) AS QuantityReceived
			,ItemId
			,PoHeaderId
			,ItemDescription
		FROM RcvShipmentLines
		GROUP BY ItemId, PoHeaderId, ItemDescription
	) RSL ON RSL.PoHeaderId = PO.Id AND (RSL.ItemId = POL.ItemId OR RSL.ItemDescription = POL.ItemDescription)
	LEFT JOIN MstCatalog CAT ON CAT.Id = INV.Catalog AND CAT.IsSkipInvCheck = 1 AND CAT.IsDeleted = 0
	WHERE PO.Id = @PoId
	GROUP BY PO.Id, PO.Segment1, INV.PartName, INV.PartNameSupplier, POL.UnitPrice, INV.PartNo, INV.Color, CAT.IsSkipInvCheck, INV.Id
	ORDER BY PO.Id DESC
END;