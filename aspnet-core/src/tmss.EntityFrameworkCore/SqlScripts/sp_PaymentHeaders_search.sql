USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_PaymentHeaders_search]    Script Date: 4/16/2023 8:38:13 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_PaymentHeaders_search]
    @PaymentNo NVARCHAR(500),
	@InvoiceNo nvarchar(500),
	@PoNo nvarchar(500),
	@RequestDateFrom DATETIME, 
	@RequestDateTo DATETIME, 
	@VendorId BIGINT, 
	@EmployeeId BIGINT, 
	@Status INT,
	@AuthorizationStatus VARCHAR(255),
	@MaxResultCount BIGINT,
	@SkipCount BIGINT
AS
BEGIN
    
	SELECT 
		   --header.Id,
     --      header.PaymentNo,
     --      header.RequestDate,
     --      header.RequestDuedate,
     --      header.Description,
     --      header.EmployeeId,
		   --header.VendorId,
     --      header.VendorSiteId,
     --      header.AuthorizationStatus,
     --      header.CurrencyCode,
     --      header.TotalAmount,
		   --header.AuthorizationStatus,
		   --header.Status,
		   header.*,
		   us.Name as EmployeeName, 
		   s.SupplierName, 
		   ss.VendorSiteCode,
		   COUNT(header.Id) OVER() AS TotalCount
 FROM dbo.PaymentHeaders header
 inner join
 (
	select 
		payLine.PaymentHeaderId
	from PaymentLines payLine 
	left join InvoiceHeaders invH on payLine.InvoiceId = invH.Id
	left join InvoiceLines invL on payLine.InvoiceId = invL.InvoiceId
	where (isnull(@InvoiceNo,'')='' or invH.InvoiceNum = @InvoiceNo)
	and (isnull(@PoNo,'')='' or invL.PoNumber = @PoNo)
	group by payLine.PaymentHeaderId	
 ) line on header.Id = line.PaymentHeaderId
	
 LEFT JOIN AbpUsers us on header.EmployeeId = us.Id
 LEFT JOIN MstSuppliers s on header.VendorId = s.Id 
 LEFT JOIN MstSupplierSites ss on header.VendorSiteId = ss.Id 
 
 WHERE (@PaymentNo is null or @PaymentNo ='' or header.PaymentNo like CONCAT('%',@PaymentNo,'%'))
	AND (@RequestDateFrom IS NULL OR header.RequestDate >= @RequestDateFrom) 
	AND (@RequestDateTo IS NULL OR header.RequestDate <= @RequestDateTo) 
	AND (@VendorId IS NULL OR @VendorId = -1 OR header.VendorId = @VendorId) 
	AND (@EmployeeId IS NULL OR @EmployeeId = -1 OR header.EmployeeId = @EmployeeId) 
	AND (@Status IS NULL OR @Status = -1 OR header.Status = @Status) 
	AND (@AuthorizationStatus is null or @AuthorizationStatus ='' or header.AuthorizationStatus = @AuthorizationStatus) 
	ORDER BY header.RequestDate DESC
	OFFSET @SkipCount ROWS
	FETCH FIRST @MaxResultCount ROWS ONLY;
END