USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_PcsQueryPoNumberByVendor]    Script Date: 4/20/2023 2:36:53 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_PcsQueryPoNumberByVendor]
(
	@VendorId BIGINT
)
WITH RECOMPILE
AS
BEGIN
	SELECT
		PO.Id
		,PO.Segment1 AS PoNumber
		,SUP.SupplierName AS VendorName
		,PO.CreationTime
		,PO.Comments AS Description
	FROM PoHeaders PO
	INNER JOIN MstSuppliers SUP ON SUP.Id = PO.VendorId
	WHERE SUP.Id = @VendorId
	ORDER BY PO.Id DESC
END;