USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[Sp_InvUpdateHeader]    Script Date: 4/12/2023 5:53:48 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[Sp_InvUpdateHeader]
(
	@p_invoice_id BIGINT,
	@p_InvoiceSymbol NVARCHAR(10),
	@p_Description NVARCHAR(255),
	@p_invoice_date date,
	@p_CurrencyCode NVARCHAR(15),
	@p_Rate DECIMAL(18,5),
	@p_InvoiceAmount DECIMAL(18,5),
	@p_VatAmount DECIMAL(18,5),
	@p_TaxName NVARCHAR(100),
	@p_TaxRate DECIMAL(18,5),
	@p_user BIGINT,
	@p_Status NVARCHAR(30),
	@p_Source NVARCHAR(15),
	@p_LookupCode NVARCHAR(50),
	@p_LookupLink NVARCHAR(500),
	@p_VendorId BIGINT,
	@p_VendorName NVARCHAR(255),
	@p_VendorNumber NVARCHAR(30)
)
AS 
UPDATE InvoiceHeaders
SET InvoiceSymbol = @p_InvoiceSymbol,  
    Description = @p_Description,
    InvoiceDate = @p_invoice_date,
    CurrencyCode =@p_CurrencyCode,
    Rate = @p_Rate,
    InvoiceAmount = @p_InvoiceAmount,
    AmountVat = @p_VatAmount,
    TaxName = @p_TaxName,
    TaxRate = @p_TaxRate,
    LastModificationTime = GETDATE(),
    LastModifierUserId = @p_user,
	Status = @p_Status,
	Source = @p_Source,
	LookupCode = @p_LookupCode,
	LookupLink = @p_LookupLink,
	VendorId = @p_VendorId,
	VendorName = @p_VendorName,
	VendorNumber = @p_VendorNumber
WHERE Id = @p_invoice_id;

select * FROM InvoiceHeaders WHERE Id = @p_invoice_id;
