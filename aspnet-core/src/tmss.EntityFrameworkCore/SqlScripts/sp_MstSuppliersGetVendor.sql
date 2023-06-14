USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_MstSuppliersGetVendor]    Script Date: 4/10/2023 4:50:55 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_MstSuppliersGetVendor]
AS 
SELECT Id, ms.SupplierName, ms.SupplierNumber from MstSuppliers ms
WHERE ms.IsDeleted = 0;