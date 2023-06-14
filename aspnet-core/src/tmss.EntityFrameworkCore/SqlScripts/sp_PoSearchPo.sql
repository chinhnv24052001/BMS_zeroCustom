ALTER PROC [dbo].[sp_PoSearchPo]
		@OrdersNo varchar(50),
		@SupplierId bigint,
		@BillToLocationId bigint,
		@ShipToLocationId bigint,
		@InventoryGroupId bigint,
		@Status varchar(20),
		@BuyerId bigint,
		@UserId BIGINT,
		@IsInternal BIT,
		@FromDate datetime2(7),
		@ToDate datetime2(7),
		@MaxResultCount BIGINT,
		@SkipCount BIGINT
	AS 
	BEGIN
	Declare @VendorIdUser bigint;
	Declare @IsBuyer bit;

	set @VendorIdUser = 0;
	select 
		@VendorIdUser = contact.SupplierId,
		@IsBuyer = US.IsBuyer
	from AbpUsers US
	left join MstSupplierContacts contact on  US.SupplierContactId = contact.Id
	where US.Id = @UserId
	;

		select 
			poHeaders.Id,
			poHeaders.Segment1 AS OrdersNo,
			poHeaders.Comments Description,
			lookupCode.Description TypeLookupCode,
			poHeaders.AuthorizationStatus,
			polookBudStatus.DisplayedField AS CheckBudgetStatus,
			poHeaders.CreationTime OrderDate,
			suppler.SupplierName,
			supplierSite.VendorSiteCode,
			poHeaders.CurrencyCode AS Currency,
			groups.ProductGroupName,
			PriceLine.TotalPrice AS Amount,
			usBuyer.Name AS BuyerName,
			poHeaders.DepartmentApprovalName,
			case when poHeaders.IsVendorConfirm = 1 then 'Yes' else 'No' end as IsVendorConfirm,
			(
				SELECT step.RequestNote + ',' AS [text()]
				FROM RequestApprovalStep step WITH (NOLOCK)
				WHERE step.ReqId = poHeaders.Id
				FOR XML PATH ('')
			) RequestNote,
			(
				SELECT step.ReplyNote + ',' AS [text()]
				FROM RequestApprovalStep step WITH (NOLOCK)
				WHERE step.ReqId = poHeaders.Id
				FOR XML PATH ('')
			) ReplyNote,
			COUNT(poHeaders.Id) OVER() AS TotalCount
		from PoHeaders poHeaders
			left join MstLookup polookAuStatus on poHeaders.AuthorizationStatus = polookAuStatus.LookupCode
			left join MstLookup polookBudStatus on poHeaders.AuthorizationStatus = polookBudStatus.LookupCode
			left join MstSuppliers suppler on poHeaders.VendorId = suppler.Id
			left join MstSupplierSites supplierSite on poHeaders.VendorSiteId = supplierSite.Id
			left join MstInventoryGroup groups on poHeaders.InventoryGroupId = groups.Id and groups.IsDeleted = 0
			left JOIN AbpUsers US ON US.ID = poHeaders.CreatorUserId and poHeaders.IsDeleted = 0
			left join AbpUsers usBuyer on poHeaders.AgentId = usBuyer.Id
			left join PoLookupCodes lookupCode on poHeaders.TypeLookupCode = lookupCode.LookupCode and lookupCode.LookupType = 'PO TYPE'
			left join (
				select sum(isnull(line.UnitPrice, 0) * isnull(line.Quantity, 0)) TotalPrice, PoHeaderId
				from PoLines line
				Group by PoHeaderId
			) PriceLine on poHeaders.Id = PriceLine.PoHeaderId
		where ((@IsInternal = 1 AND @IsBuyer = 1) OR (@IsInternal = 0 AND poHeaders.VendorId = @VendorIdUser and poHeaders.AuthorizationStatus = 'APPROVED')) 
			AND (ISNULL(@OrdersNo, '') = '' OR poHeaders.Segment1 LIKE '%' + @OrdersNo + '%')
			AND (ISNULL(@FromDate, '') = '' OR CAST(poHeaders.CreationTime AS DATE) >= CAST(@FromDate AS DATE))
			AND (ISNULL(@ToDate, '') = '' OR CAST(poHeaders.CreationTime AS DATE) <= CAST(@ToDate AS DATE))
			AND (ISNULL(@SupplierId, 0) = 0 OR poHeaders.VendorId = @SupplierId)
			AND (ISNULL(@Status, '') = '' OR poHeaders.AuthorizationStatus = @Status)
			AND (ISNULL(@BuyerId, 0) = 0 OR poHeaders.CreatorUserId = @BuyerId)
			AND (ISNULL(@InventoryGroupId, 0) = 0 OR poHeaders.InventoryGroupId = @InventoryGroupId)
			and poHeaders.IsDeleted = 0
	ORDER BY poHeaders.CreationTime DESC
	OFFSET @SkipCount ROWS
	FETCH FIRST @MaxResultCount ROWS ONLY;
END