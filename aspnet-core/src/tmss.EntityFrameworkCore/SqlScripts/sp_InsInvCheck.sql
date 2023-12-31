USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_InsInvCheck]    Script Date: 4/9/2023 12:13:10 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_InsInvCheck]
(@p_user_id BIGINT,
 @p_supplier_name varchar(255),
 @p_po_number varchar(255),
 @p_part_no VARCHAR(255),
 @p_qty DECIMAL,
 @p_unit_price DECIMAL,
 @v_invoiceprice DECIMAL
)
AS
BEGIN
	INSERT INTO TempCheckImportInvoice (SupplierName, PONumber, PartNo, UserId, Qty, UnitPrice, InvoicePrice)
	VALUES (@p_supplier_name, @p_po_number, @p_part_no, @p_user_id, @p_qty, @p_unit_price, @v_invoiceprice)
END;
