USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_PaymentGetAllInvoices]    Script Date: 4/23/2023 9:54:50 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO


--SET QUOTED_IDENTIFIER ON|OFF
--SET ANSI_NULLS ON|OFF
--GO
ALTER PROCEDURE [dbo].[sp_PaymentGetAllInvoices]
    @InvoiceNum NVARCHAR(500),
	@VendorId BIGINT, 
	@VendorSiteId BIGINT,
	@MaxResultCount BIGINT,
	@SkipCount BIGINT,
	@CurrencyCode NVARCHAR(50)
AS
BEGIN
    
	SELECT distinct header.Id
      ,(case when header.InvoiceSymbol is not null and header.InvoiceSymbol <> '' then  header.InvoiceSymbol + '-' + header.InvoiceNum else  header.InvoiceNum end)  as InvoiceNum
      ,header.InvoiceSymbol
      ,header.Description
      ,header.InvoiceDate
      ,header.VendorId
      ,header.VendorName
      ,header.VendorNumber
      ,header.VendorSiteId
      ,header.CurrencyCode
      ,header.Rate
      ,header.RateDate
      ,header.InvoiceAmount
      ,header.AmountVat
      ,header.TaxId
      ,header.TaxName
      ,header.TaxRate
      ,header.Differency
      ,header.AdjustmentForInvoiceId
	  ,header.AmountDeducted
      ,header.IsPaid
	  ,po.Segment1 PoNo
	  ,s.SupplierName
	  ,header.IsAdjustmentInvoice
	  ,ISNULL(preAmt.Amount,0) PreAmount
	  ,header.InvoiceAmount - ISNULL(preAmt.Amount,0) AvailableAmount
	  ,COUNT(header.Id) OVER() AS TotalCount
 FROM InvoiceHeaders header
 left join InvoiceLines il on header.Id	= il.InvoiceId 
 left join PoHeaders po on il.PoHeaderId = po.Id 
 LEFT JOIN MstSuppliers s on header.VendorId = s.Id 
 LEFT JOIN MstSupplierSites ss on header.VendorSiteId = ss.Id 
 LEFT JOIN (
	select p.InvoiceId, sum(p.Amount) Amount 
	from PaymentPrepayment p
	where p.IsDeleted = 0 and p.IsPaymentAdded = 0 and p.IsAppliedInvoice = 1
	group by p.InvoiceId
 ) preAmt on preAmt.InvoiceId = header.Id
 WHERE (@InvoiceNum is null or @InvoiceNum ='' or header.InvoiceNum like CONCAT('%',@InvoiceNum,'%'))
	AND (@VendorId IS NULL OR @VendorId = 0 OR @VendorId = -1 OR header.VendorId = @VendorId) 
	AND (@VendorSiteId IS NULL OR @VendorSiteId = 0 OR @VendorSiteId = -1 OR header.VendorSiteId = @VendorSiteId) 
	and (@CurrencyCode is null or header.CurrencyCode = @CurrencyCode )
	AND header.IsDeleted = 0
	and ((header.Status = 'Matched') or (header.Status <> 'Matched' and il.PoHeaderId is not null and po.Id is not null and po.IsPrepayReceipt = 1))
	AND header.IsPaid = 0 -- moi inv chi dc lam thanh toan 1 lan 
	ORDER BY header.InvoiceDate DESC 
	OFFSET @SkipCount ROWS
	FETCH FIRST @MaxResultCount ROWS ONLY;
END
