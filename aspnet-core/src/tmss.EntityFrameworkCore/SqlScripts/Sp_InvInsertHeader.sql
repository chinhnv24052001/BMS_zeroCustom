USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[Sp_InvInsertHeader]    Script Date: 4/10/2023 1:04:33 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[Sp_InvInsertHeader]
(
@p_InvoiceNum NVARCHAR(50),
@p_InvoiceSymbol NVARCHAR(10),
@p_Description NVARCHAR(255),
@p_invoice_date date,
@p_VendorId bigint,
@p_VendorName NVARCHAR(255),
@p_VendorNumber  NVARCHAR(30),
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
@p_LookupLink NVARCHAR(500)
)
AS
BEGIN
	DECLARE @v_VatRegistration NVARCHAR(255);
	DECLARE @v_PicInvoice NVARCHAR(255);
	DECLARE @v_PicInvoiceEmailAddress NVARCHAR(255);

	SELECT @v_VatRegistration = VatRegistrationNum FROM MstSuppliers WHERE Id = @p_VendorId
	SELECT @v_PicInvoice = Name, @v_PicInvoiceEmailAddress = EmailAddress FROM AbpUsers WHERE Id = @p_user

	INSERT INTO InvoiceHeaders
		(InvoiceNum, InvoiceSymbol, Description, InvoiceDate, VendorId, VendorName,
		VendorNumber, CurrencyCode, Rate, InvoiceAmount, AmountVat, TaxName, TaxRate, Status, Source, LookupCode, LookupLink, VatRegistrationInvoice, PicInvoice, PicInvoiceUserId, PicInvoiceEmailAddress,
		CreationTime, CreatorUserId, IsDeleted)
	VALUES
		(@p_InvoiceNum, @p_InvoiceSymbol, @p_Description, @p_invoice_date, @p_VendorId, @p_VendorName,
		@p_VendorNumber, @p_CurrencyCode, @p_Rate, @p_InvoiceAmount, @p_VatAmount, @p_TaxName, @p_TaxRate, @p_Status, @p_Source, @p_LookupCode, @p_LookupLink, @v_VatRegistration, @v_PicInvoice, @p_user, @v_PicInvoiceEmailAddress,
		GETDATE(), @p_user,0);
	SELECT SCOPE_IDENTITY() AS Id;
END;
