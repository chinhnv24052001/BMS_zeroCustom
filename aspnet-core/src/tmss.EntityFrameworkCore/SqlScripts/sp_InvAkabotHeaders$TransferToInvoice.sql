USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_InvAkabotHeaders$TransferToInvoice]    Script Date: 4/14/2023 3:45:44 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROC [dbo].[sp_InvAkabotHeaders$TransferToInvoice]
	@InvAkabotHeaderId BIGINT
AS
BEGIN
	DECLARE @InvoiceNum NVARCHAR(50);
	DECLARE @VendorId BIGINT;
	DECLARE @InvoiceHeaderId BIGINT;

	BEGIN TRY
		BEGIN TRANSACTION
				SELECT
					@InvoiceNum = AKH.InvoiceNum,
					@VendorId = SUP.Id
				FROM InvAkabotHeaders AKH
				LEFT JOIN MstSuppliers SUP ON SUP.VatRegistrationInvoice = AKH.SellerTaxCode AND AKH.IsDeleted = 0
				WHERE AKH.Id = @InvAkabotHeaderId;
				--check xem so invoice voi nha cung đã có chưa
				IF NOT EXISTS (
					SELECT *
					FROM InvoiceHeaders
					WHERE VendorId = @VendorId AND InvoiceNum = @InvoiceNum AND IsDeleted = 0
				)
				BEGIN
					INSERT INTO InvoiceHeaders(
						InvoiceNum
						,Description
						,InvoiceDate
						,VendorId
						,VendorName
						,VendorNumber
						--,VendorSiteId
						,CurrencyCode
						,AmountVat
						,InvoiceAmount
						,IsDeleted
						,CreationTime
						,CreatorUserId
						,Source
						,InvoiceSymbol
						,PicInvoiceUserId
						,PicInvoice
						,PicInvoiceEmailAddress
						,VatRegistrationInvoice
						,Status
						,TaxRate
					)
					SELECT 
						InvoiceNum
						,AKH.Description
						,AKH.InvoiceDate
						,SUP.Id
						,SUP.SupplierName
						,SUP.SupplierNumber
						--,SUP.TaxPayerId
						,AKH.Currency
						,AKH.VatAmount
						,AKH.InvoiceAmount
						,0
						,GETDATE()
						,-1
						,'Automatic'
						,SerialNo
						,US.Id
						,AKH.SenderName
						,AKH.SenderEmail
						,AKH.SellerTaxCode
						,'Not Matched'
						,AKH.TaxRate
					FROM InvAkabotHeaders AKH
					LEFT JOIN MstSuppliers SUP ON (SUP.VatRegistrationNum = AKH.SellerTaxCode OR SUP.VatRegistrationInvoice = AKH.SellerTaxCode)
					LEFT JOIN InvAkaReadEmailLogs ELOG ON ELOG.InvoiceNo = AKH.InvoiceNum AND ELOG.SupplierCode = SUP.VatRegistrationInvoice
					LEFT JOIN AbpUsers US ON US.EmailAddress = AKH.SenderEmail AND US.IsDeleted = 0
					WHERE AKH.Id = @InvAkabotHeaderId
					AND (ISNULL(SUP.StartDateActive, '') = '' OR SUP.StartDateActive <= GETDATE())
					AND (ISNULL(SUP.EndDateActive, '') = '' OR SUP.EndDateActive >= GETDATE())
					AND SUP.IsDeleted = 0;

					SELECT @InvoiceHeaderId = SCOPE_IDENTITY();

					INSERT INTO InvoiceLines
					(
						InvoiceId
						,PoNumber
						,PoHeaderId
						,VendorId
						,ItemId
						,ItemNumber
						,ItemDescription
						,Quantity
						,QuantityOrder
						,ForeignPrice
						,UnitPricePO
						,Amount
						,Status
						,TaxRate
						,IsDeleted
						,CreationTime
						,CreatorUserId
					)
					SELECT
						@InvoiceHeaderId
						,AKL.PoNo
						,PO.Id
						,SUP.Id
						,INV.Id
						,INV.PartNo
						,AKL.DistDescription
						,AKL.QuantityInvoiced
						,tb1.Quantity
						,AKL.UnitPrice
						,tb1.UnitPrice
						,AKL.DistAmount
						,CASE WHEN (ISNULL(CAT.ID, '') = '' OR ISNULL(PO.IsPrepayReceipt, 0) = 0) THEN 'Not Matched' ELSE 'Matched' END
						,CASE WHEN AKL.VATRate IS NOT NULL THEN SUBSTRING(AKL.VATRate, 0, CHARINDEX('%', AKL.VATRate)) ELSE 0 END
						,0
						,GETDATE()
						,-1
					FROM InvAkabotLines AKL
					INNER JOIN InvAkabotHeaders AKH ON AKH.Id = AKL.InvAkabotHeaderId
					LEFT JOIN MstSuppliers SUP ON SUP.VatRegistrationInvoice = AKH.SellerTaxCode
					LEFT JOIN MstInventoryItems INV ON INV.SupplierId = SUP.Id AND 
						(INV.PartNameSupplier = AKL.DistDescription OR  INV.PartName = AKL.DistDescription)
						 AND INV.OrganizationId = 84 AND INV.IsDeleted = 0
					LEFT JOIN MstCatalog CAT ON CAT.Id = INV.Catalog AND CAT.IsSkipInvCheck = 1 AND CAT.IsDeleted = 0
					LEFT JOIN PoHeaders PO ON PO.Segment1 = AKL.PoNo
					LEFT JOIN (
						SELECT
							POL.PoHeaderId
							,POL.sumQty AS Quantity
							,POL.UnitPrice
							,POL.ItemId
						FROM InvAkabotLines AKL
						LEFT JOIN PoHeaders PO ON PO.Segment1 = AKL.PoNo
						LEFT JOIN (
							SELECT
								SUM(Quantity) sumQty
								,PoHeaderId
								,UnitPrice
								,ItemId
							FROM PoLines
							GROUP BY PoHeaderId, UnitPrice, ItemId
						) POL ON POL.PoHeaderId = PO.Id
						WHERE AKL.InvAkabotHeaderId = @InvAkabotHeaderId
						GROUP BY POL.PoHeaderId, POL.UnitPrice, POL.ItemId, POL.sumQty
					) tb1 ON tb1.PoHeaderId = PO.Id AND tb1.ItemId = INV.Id
					WHERE AKL.InvAkabotHeaderId = @InvAkabotHeaderId
					AND (ISNULL(SUP.StartDateActive, '') = '' OR SUP.StartDateActive <= GETDATE())
					AND (ISNULL(SUP.EndDateActive, '') = '' OR SUP.EndDateActive >= GETDATE())
					AND SUP.IsDeleted = 0;

					-- Danh dau nhung dong matched status theo key word
					DECLARE @keywordAutoMatched NVARCHAR(MAX);
					SELECT @keywordAutoMatched = Description
					FROM MstLookup
					WHERE LookupCode ='INVOCE_LINE_AUTO_MATCH_KEYWORD';

					UPDATE InvoiceLines
					SET Status = 'Matched'
					WHERE Id IN (
						SELECT invline.Id
						FROM 
						(
							SELECT Id,ItemDescription
							FROM InvoiceLines
							WHERE InvoiceId = @InvoiceHeaderId
						) invline
						JOIN (
							SELECT VALUE
							FROM STRING_SPLIT(@keywordAutoMatched, ',')
						) keyword ON invline.ItemDescription LIKE CONCAT('%', keyword.VALUE, '%')

					) AND InvoiceId = @InvoiceHeaderId;

					-- Cap nhat trang thai Matched cho hoa don co tat ca cac dong Matched
					UPDATE InvoiceHeaders SET Status = 'Matched'
					WHERE NOT EXISTS (SELECT * FROM InvoiceLines WHERE InvoiceId = @InvoiceHeaderId AND Status = 'Not Matched')
					AND Id = @InvoiceHeaderId

					-- Insert file
					INSERT INTO MstAttachFiles (HeaderId, OriginalFileName, RootPath, CreationTime, CreatorUserId, AttachFileType, IsDeleted)
					SELECT
						@InvoiceHeaderId
						,AKF.OriginalFileName
						,'INVOICE' + REPLACE(AKF.ServerFileName, '\', '/')
						,GETDATE()
						,-1
						,'INVOICE'
						,0
					FROM InvAkabotFiles AKF
					INNER JOIN InvAkabotHeaders AKH ON AKH.Id = AKF.InvAkabotHeaderId
					WHERE AKH.Id = @InvAkabotHeaderId;
				END;
		COMMIT TRANSACTION;
	END TRY
	BEGIN CATCH
		SELECT ERROR_MESSAGE() AS ErrorMessage
		SELECT ERROR_LINE() AS ErrorLine
		ROLLBACK TRANSACTION
	END CATCH;
END;