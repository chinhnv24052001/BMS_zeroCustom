USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[Sp_InvInsertLines]    Script Date: 4/15/2023 1:57:43 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[Sp_InvInsertLines]
(
@p_InvoiceId BIGINT,
@p_PoHeaderId BIGINT,
@p_PoNumber NVARCHAR(20),
@p_VendorId bigint,
@p_ItemId bigint,
@p_LineNum int,
@p_ItemNumber NVARCHAR(100),
@p_ItemDescription  NVARCHAR(255),
@p_CategoryId bigint,
@p_Quantity DECIMAL(18,5),
@p_QuantityOrder DECIMAL(18,5),
@p_ForeignPrice DECIMAL(18,5),
@p_user BIGINT,
@p_TaxRate DECIMAL(18,5),
@p_QuantityGR DECIMAL(18,5),
@p_QuantityMatched DECIMAL(18,5),
@p_unitPricePO DECIMAL(18,5),
@p_Status NVARCHAR(50),
@p_Note NVARCHAR(255)
)
AS
BEGIN
	INSERT INTO InvoiceLines
		(InvoiceId,  PoHeaderId, PoNumber, VendorId, ItemId, ItemNumber, LineNum, 
		ItemDescription, CategoryId, Quantity, QuantityOrder, 
		Amount, AmountVat, ForeignPrice, CreationTime, CreatorUserId, IsDeleted, 
		TaxRate,QuantityReceived,QuantityMatched, UnitPricePO, Status, Note)
	VALUES
		(@p_InvoiceId, @p_PoHeaderId, @p_PoNumber, @p_VendorId, @p_ItemId,@p_ItemNumber, @p_LineNum,
		@p_ItemDescription, @p_CategoryId, @p_Quantity, @p_QuantityOrder,
		@p_ForeignPrice * @p_Quantity, @p_ForeignPrice * @p_Quantity * @p_TaxRate/100, 
		@p_ForeignPrice, GETDATE(), @p_user, 0, @p_TaxRate,@p_QuantityGR,@p_QuantityMatched, @p_unitPricePO, @p_Status, @p_Note)
END;