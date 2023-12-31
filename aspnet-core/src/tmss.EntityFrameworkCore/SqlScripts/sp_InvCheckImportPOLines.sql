USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_InvCheckImportPOLines]    Script Date: 4/10/2023 5:09:11 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_InvCheckImportPOLines] (
	@p_poNum VARCHAR(255),
	@p_vendorId BIGINT,
	@p_userId BIGINT,
	@p_itemNum VARCHAR(255)
)
AS
BEGIN
	IF EXISTS (SELECT
					pl.Id
				FROM PoLines pl
				INNER JOIN PoHeaders ph ON pl.PoHeaderId = ph.Id
				INNER JOIN MstSuppliers ms ON ph.VendorId = ms.Id
				INNER JOIN MstInventoryItems mii ON mii.Id = pl.ItemId
				WHERE mii.OrganizationId = 84
				AND ph.Segment1 = @p_poNum
				AND ph.VendorId = @p_vendorId
				AND (mii.PartNo = @p_itemNum
				OR ISNULL(@p_itemNum, '') = ''))
		BEGIN
		--EXEC sp_InvInsTmptTable @p_poNum,@p_vendorId,@p_userId,@p_itemNum
			SELECT
				a.*,
				a.QuantityOrder - ISNULL(remainPO.Quantity, 0) Quantity
			FROM (
				SELECT
					1 AS Id
					,ph.Segment1 PONumber
					,MAX(ph.CreationTime) CreationTime
					,ph.Comments
					,ms.SupplierName
					,ph.CurrencyCode
					,pl.UnitPrice
					,SUM(pl.Quantity) QuantityOrder  
					,pl.CategoryId
					,items.PartName ItemDescription
					,items.PartNo ItemNumber
					,MAX(pl.LineNum) LineNum
					,pl.PoHeaderId
					,pl.ItemId
					,rsl.QuantityReceived
					,items.TaxPrice TaxRate
				FROM PoHeaders ph
				INNER JOIN MstSuppliers ms ON ms.Id = ph.VendorId
				INNER JOIN PoLines pl ON ph.Id = pl.PoHeaderId
				INNER JOIN RcvShipmentLines rsl ON rsl.PoLineId =pl.Id
				left JOIN MstInventoryItems items ON items.Id = pl.ItemId AND items.OrganizationId =84
				WHERE ph.AuthorizationStatus = 'APPROVED'
				AND ph.VendorId = @p_vendorId AND ph.Segment1 = @p_poNum AND (items.PartNo = @p_itemNum OR ISNULL(@p_itemNum, '') = '')              
				GROUP BY ph.Segment1, ph.Comments, ms.SupplierName, ph.CurrencyCode, pl.UnitPrice, pl.CategoryId, items.PartName, items.PartNo,
					pl.PoHeaderId, pl.ItemId, rsl.QuantityReceived, items.TaxPrice) a
				LEFT JOIN 
				(
					SELECT
						invLines.PoHeaderId
						,invLines.ItemId
						,SUM(invLines.Quantity) Quantity  
					FROM InvoiceLines invLines
					INNER JOIN InvoiceHeaders invHeaders  ON invLines.InvoiceId = invHeaders.Id
					WHERE invHeaders.VendorId = @p_vendorId
					GROUP BY invLines.PoHeaderId, invLines.ItemId
				) remainPO ON a.PoHeaderId = remainPO.PoHeaderId AND remainPO.ItemId = a.ItemId
			WHERE a.QuantityOrder -ISNULL(remainPO.Quantity,0)>0
		END
	ELSE
		SELECT 0 AS Id
END;
