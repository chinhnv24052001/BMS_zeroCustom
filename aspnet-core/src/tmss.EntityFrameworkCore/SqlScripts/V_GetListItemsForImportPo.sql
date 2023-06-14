 ALTER VIEW [dbo].[V_GetListItemsForImportPo]
 AS
	select 
		temp.Id,
		temp.VendorId,
		temp.VendorSiteId,
		part.Id ItemId,
		isnull(part.PartName, temp.ProductName) PartName,
		temp.Quantity,
		isnull(part.UnitPrice, temp.UnitPrice) UnitPrice,
		'Variable' PriceType,
		isnull(temp.NeedByPaintSteel, temp.NeedByLocalParts) NeedByPaintSteel,
		isnull(temp.GlDate, getdate()) GlDate,
		oz.Id OrganizationId,
		isnull(locations.Id, 21) LocationId,
		temp.Subinventory,
		temp.CreatorUserId,
		isnull(part.CurrencyCode, 'VND') CurrencyCode,
		--part.CategoryId,
		isnull(part.PrimaryUnitOfMeasure, temp.Uom) PrimaryUnitOfMeasure,
		part.InventoryGroupId,
		glCom.Id CodeCombinationId,
		temp.BudgetCode,
		isnull(part.DestinationTypeCode, 'EXPENSE') DestinationType
	from PoImportPurchaseOrderTemp temp
	left join MstOrganizations oz on temp.Organization = oz.Name
	left join MstLocations locations on temp.Location = locations.LocationCode
	left join MstSupplierSites sites on temp.VendorSiteId = sites.Id and temp.VendorId = sites.SupplierId
	left join MstGlCodeCombination glCom on temp.BudgetCode = glCom.ConcatenatedSegments
	left join V_GetPartList part on temp.ProductCode = part.PartNo
	where temp.IsDeleted = 0
GO