USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[Sp_InvDeleteLines]    Script Date: 4/12/2023 6:05:42 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[Sp_InvDeleteLines]
(@p_invoice_id BIGINT)
AS
BEGIN
	DELETE InvoiceLines WHERE InvoiceId = @p_invoice_id;
END;
