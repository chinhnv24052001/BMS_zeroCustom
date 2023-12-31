USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_PcsDeleteInvoice]    Script Date: 4/12/2023 1:34:54 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_PcsDeleteInvoice]
(
	@InvoiceId BIGINT,
	@UserId BIGINT
)
WITH RECOMPILE
AS
BEGIN
	UPDATE InvoiceLines SET IsDeleted = 1, DeletionTime = GETDATE(), DeleterUserId = @UserId WHERE InvoiceId = @InvoiceId
	UPDATE InvoiceHeaders SET IsDeleted = 1, DeletionTime = GETDATE(), DeleterUserId = @UserId WHERE Id = @InvoiceId
END;