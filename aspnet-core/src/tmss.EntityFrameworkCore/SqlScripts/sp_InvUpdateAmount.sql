USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_InvUpdateAmount]    Script Date: 4/10/2023 1:56:56 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_InvUpdateAmount]
(
@p_invoice_id BIGINT
)
AS
BEGIN
	DECLARE @p_amountPO DECIMAL(18,5) = 0;
	DECLARE @p_amount DECIMAL(18,5) = 0;
	DECLARE @p_amountVat DECIMAL(18,5) = 0;
	DECLARE @p_amountVatPO DECIMAL(18,5) = 0;

	SELECT 
		@p_amount = SUM(il.Amount) + SUM(il.AmountVat),
		@p_amountVat = SUM(il.AmountVat),
		@p_amountPO = SUM(il.UnitPricePO * il.Quantity),
		@p_amountVatPO = SUM(il.UnitPricePO * il.Quantity * il.TaxRate/100)
	FROM InvoiceLines il
	WHERE il.InvoiceId = @p_invoice_id;

	IF (@p_amount != 0)
	UPDATE InvoiceHeaders SET --InvoiceAmount = @p_amount, AmountVat = @p_amountVat,
							  InvoiceAmountPO = @p_amountPO, AmountVatPO = @p_amountVatPO,
							  Differency = @p_amount + @p_amountVat - @p_amountPO - @p_amountVatPO
	WHERE Id = @p_invoice_id;
END;