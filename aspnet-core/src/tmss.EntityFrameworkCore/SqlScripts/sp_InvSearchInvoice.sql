USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_InvSearchInvoice]    Script Date: 4/8/2023 9:08:49 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_InvSearchInvoice]
(
	@p_invoice_num VARCHAR(255),
	@p_invoice_symbol VARCHAR(255),
	@p_vendor_id bigint,
	@p_from_date date,
	@p_to_date DATE,
	@p_status NVARCHAR(50),
	@p_source NVARCHAR(15),
	@p_create_invoice_date DATETIME2(7),
	@p_puchase_order_no NVARCHAR(20),
	@p_vat_registration_invoice NVARCHAR(255),
	@p_pic_user_id BIGINT,
	@MaxResultCount BIGINT,
	@SkipCount BIGINT
)
AS
BEGIN
	SET NOCOUNT ON;
	SELECT
		a.Id
		,a.InvoiceNum
		,a.InvoiceSymbol
		,a.VendorNumber
		,a.VendorName
		,a.InvoiceDate
		,a.TaxName
		,a.TaxRate
		,a.CurrencyCode
		,a.Rate
		,'' MatchingStatusText
		,'' ConfirmStatusText
		,a.InvoiceAmount TotalAmount
		--,a.Rate TotalTaxAmount
		--,ISNULL(a.InvoiceAmount, 0) + ISNULL(a.AmountVat, 0) TotalPaymentAmount
		,a.InvoiceAmount TotalPaymentAmount
		,a.AmountVat TotalTaxAmount
		,COUNT(a.Id) OVER() AS TotalCount
		,a.VendorId
		,mc.Id CurrencyId
		,a.Description
		,a.IsPaid
		,ISNULL(a.InvoiceAmountPO, 0) + ISNULL(a.AmountVatPO, 0) InvoiceAmountPO
		,a.LookupCode
		,a.LookupLink
		,a.Status
		,a.Source
		,a.VatRegistrationInvoice
		,ms.VatRegistrationNum
		,a.PicInvoice
	FROM InvoiceHeaders a
	LEFT JOIN MstSuppliers ms ON a.VendorId = ms.Id
	LEFT JOIN MstCurrency mc ON mc.CurrencyCode = a.CurrencyCode
	LEFT JOIN (
		SELECT
			InvoiceId
		FROM InvoiceLines
		WHERE (ISNULL(@p_puchase_order_no, '') = '' OR PoNumber LIKE '%' + @p_puchase_order_no + '%')
		GROUP BY InvoiceId
	) IVL ON IVL.InvoiceId = a.Id
	WHERE a.IsDeleted = 0
	AND (ISNULL(@p_invoice_num,'')='' OR a.InvoiceNum LIKE CONCAT('%',@p_invoice_num,'%'))
	AND (ISNULL(@p_invoice_symbol,'')='' OR a.InvoiceSymbol LIKE CONCAT('%',@p_invoice_symbol,'%'))
	AND (ISNULL(@p_source, '') = '' OR UPPER(a.Source) = UPPER(@p_source))
	AND (ISNULL(@p_create_invoice_date, '') = '' OR CAST(a.CreationTime AS DATE) = CAST(@p_create_invoice_date AS DATE))
	AND (@p_vendor_id = -1 OR a.VendorId = @p_vendor_id)
	AND (@p_from_date IS NULL OR a.InvoiceDate >= @p_from_date)
	AND (@p_to_date IS NULL OR a.InvoiceDate < DATEADD(DAY, 1, @p_to_date))
	AND (@p_vat_registration_invoice IS NULL OR ms.VatRegistrationInvoice LIKE '%' + @p_vat_registration_invoice + '%')
	AND (@p_pic_user_id IS NULL OR a.PicInvoiceUserId = @p_pic_user_id)
	AND (@p_status = '-1' OR
	EXISTS (select 1 FROM InvoiceLines il WHERE il.InvoiceId = a.Id
	AND il.Status = @p_status))
	ORDER BY a.CreationTime DESC, a.InvoiceNum
	OFFSET @SkipCount ROWS
	FETCH FIRST @MaxResultCount ROWS ONLY;
END;