ALTER PROC [dbo].[sp_PrSearchPrForAutoCreatePO]
	@RequisitionNo varchar(50),
	@PreparerId bigint,
	@BuyerId bigint,
	@SupplierId bigint,
	@SupplierSiteId bigint,
	@InventoryGroupId bigint,
	@FromDate datetime2(7),
	@ToDate datetime2(7),
	@MaxResultCount BIGINT,
	@SkipCount BIGINT
AS
BEGIN
	select 
			PrLine.Id,
			headers.RequisitionNo,
			PrLine.PrRequisitionHeaderId,
			headers.InventoryGroupId,
			gr.ProductGroupName,
			PrLine.LineTypeId,
			PrLine.ItemId,
			Item.PartNo + '.' + Item.Color PartNo,
			PrLine.ItemDescription PartName,
			PrLine.CategoryId,
			--isnull(cate.Category_Concat_Segs, mstCate.Segment1 + '.' + mstCate.Segment2) AS Category,
			PrLine.UnitMeasLookupCode,
			UOM.UOMCode,
			PrLine.NeedByDate,
			PrLine.Quantity,
			isnull(PRICE.UnitPrice, 0) UnitPrice,
			PrLine.DestinationTypeCode,
			PrLine.DestinationOrganizationId,
			usersRequester.Name AS RequesterName,
			PrLine.ToPersonId,
			PrLine.DestinationSubinventory,
			PrLine.SuggestedVendorName,
			isnull(PrLine.VendorId, supp.Id) VendorId,
			PrLine.SuggestedVendorLocation,
			PrLine.VendorSiteId,
			PrLine.DeliverToLocationId,
			loca.LocationCode,
			sites.AddressLine1 AS AddressSupplier,
			PrLine.SuggestedVendorContact,
			PrLine.SuggestedVendorPhone,
			PrLine.Attribute9,
			PrLine.Attribute10,
			PrLine.Attribute12,
			PrLine.Attribute14,
			PrLine.Attribute15,
			PrLine.ForeignPrice,
			headers.RateDate,
			isnull(Item.CurrencyId, 7) CurrencyId,
			(isnull(PrLine.Quantity, 0) * isnull(PrLine.UnitPrice, 0)) AS Amount,
			codeChageAccount.ConcatenatedSegments AS ChargeAccount,
			COUNT(headers.Id) OVER() AS TotalCount
		from PrRequisitionHeaders headers
			inner join MstInventoryGroup gr on headers.InventoryGroupId = gr.Id and gr.IsDeleted = 0
			left join PrRequisitionLines PrLine on headers.Id = PrLine.PrRequisitionHeaderId and PrLine.IsDeleted = 0
			left join PrRequisitionDistributions dis on PrLine.Id = dis.PrRequisitionLineId and dis.IsDeleted = 0
			left join PoDistributions poDis on dis.Id = poDis.PrRequisitionDistributionId and poDis.IsDeleted = 0
			left join MstGlCodeCombination codeChageAccount on dis.CodeCombinationId = codeChageAccount.Id and codeChageAccount.IsDeleted = 0
			left join MstInventoryItems Item on PrLine.ItemId = item.Id and Item.IsDeleted = 0
			left JOIN MstInventoryItemPrices PRICE ON Item.Id = PRICE.InventoryItemId and PRICE.IsDeleted = 0
			left join MstLineType LineType on PrLine.LineTypeId = LineType.Id and LineType.IsDeleted = 0
			left join MstUnitOfMeasure UOM on PrLine.UnitMeasLookupCode = UOM.UOMCode and UOM.IsDeleted = 0
			left join MstCategories mstCate on PrLine.CategoryId = mstCate.Id and mstCate.IsDeleted = 0
			left join MstOrganizations org on PrLine.DestinationOrganizationId = org.Id and org.IsDeleted = 0
			left join MstSuppliers supp on PrLine.SuggestedVendorName = supp.SupplierName
			left join MstSupplierSites sites on PrLine.VendorSiteId = sites.Id and sites.IsDeleted = 0
			left join MstLocations loca on PrLine.DeliverToLocationId = loca.Id and loca.IsDeleted = 0
			left join AbpUsers usersRequester on PrLine.ToPersonId = usersRequester.Id
		where headers.IsDeleted = 0
			and poDis.Id is null
			and headers.AuthorizationStatus = 'APPROVED'
			and (PRICE.EffectiveFrom IS NULL OR PRICE.EffectiveFrom <= GETDATE())
			AND (PRICE.EffectiveTo IS NULL OR PRICE.EffectiveTo >= GETDATE())
			AND (ISNULL(@RequisitionNo, '') = '' OR UPPER(headers.RequisitionNo) LIKE '%' + UPPER(@RequisitionNo) + '%')
			AND (ISNULL(@FromDate, '') = '' OR CAST(headers.CreationTime AS DATE) >= CAST(@FromDate AS DATE))
			AND (ISNULL(@ToDate, '') = '' OR CAST(headers.CreationTime AS DATE) <= CAST(@ToDate AS DATE))
			AND (ISNULL(@PreparerId, 0) = 0 OR headers.PreparerId = @PreparerId)
			AND (ISNULL(@BuyerId, 0) = 0 OR PrLine.ToPersonId = @BuyerId)
			AND (ISNULL(@SupplierId, 0) = 0 OR PrLine.VendorId = @SupplierId)
			AND (ISNULL(@SupplierSiteId, 0) = 0 OR PrLine.VendorSiteId = @SupplierSiteId)
			AND (ISNULL(@InventoryGroupId, 0) = 0 OR headers.InventoryGroupId = @InventoryGroupId)
	ORDER BY headers.CreationTime DESC
	OFFSET @SkipCount ROWS
	FETCH FIRST @MaxResultCount ROWS ONLY;