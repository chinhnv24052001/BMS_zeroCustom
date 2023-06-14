﻿ ALTER VIEW [dbo].[V_GetListItemsForImportPr]
 AS
  select distinct
		imppr.Id,
		ItemId,
		ProductCode,
		Quanity,
		NeedBy,
		VendorName SuggestedVendorName,
		SupplierId VendorId,
		VendorSite SuggestedVendorLocation,
		SupplierSiteId VendorSiteId,
		MonthN,
		MonthN1,
		MonthN2,
		MonthN3,
		OrganizationId DestinationOrganizationId,
		PartName ItemDescription,
		PrimaryUnitOfMeasure UnitMeasLookupCode,
		UnitPrice,
		InventoryGroupId,
		CurrencyId,
		DestinationTypeCode,
		DeliverToLocationId,
		CodeCombinationId,
		BudgetCode,
		imppr.CreatorUserId
  from (
	  select 
		Id,
		ProductCode,
		Temp,
		Quanity,
		VendorName,
		SupplierId,
		VendorSite,
		SupplierSiteId,
		MonthN,
		MonthN1,
		MonthN2,
		MonthN3,
		OrganizationId,
		ItemId,
		PartName,
		PrimaryUnitOfMeasure,
		UnitPrice,
		CurrencyId,
		DestinationTypeCode,
		DeliverToLocationId,
		CodeCombinationId,
		BudgetCode,
		InventoryGroupId,
		CreatorUserId
	  from (
	  select 
			imppr.Id,
			imppr.ProductCode,
			imppr.VendorName,
			imppr.SupplierId,
			imppr.VendorSite,
			imppr.SupplierSiteId,
			imppr.MonthN,
			imppr.MonthN1,
			imppr.MonthN2,
			imppr.MonthN3,
			oz.Id AS OrganizationId,
			part.Id ItemId,
			isnull(part.PartName, imppr.ProductName) PartName,
			isnull(part.PrimaryUnitOfMeasure, imppr.uom) PrimaryUnitOfMeasure,
			case when part.PartNo is null then isnull(imppr.UnitPrice, 0) else isnull(part.UnitPrice, 0) end UnitPrice,
			isnull(part.DestinationTypeCode, 'EXPENSE') DestinationTypeCode,
			locations.Id DeliverToLocationId,
			glcom.Id CodeCombinationId,
			imppr.BudgetCode,
			--part.CategorySetname,
			isnull(part.CurrencyId, 7) CurrencyId,
			part.InventoryGroupId,
			imppr.Delivery1,
			imppr.Delivery2,
			imppr.Delivery3,
			imppr.Delivery4,
			imppr.Delivery5,
			imppr.Delivery6,
			imppr.Delivery7,
			imppr.Delivery8,
			imppr.Delivery9,
			imppr.Delivery10,
			imppr.Delivery11,
			imppr.Delivery12,
			imppr.Delivery13,
			imppr.Delivery14,
			imppr.Delivery15,
			imppr.Delivery16,
			imppr.Delivery17,
			imppr.Delivery18,
			imppr.Delivery19,
			imppr.Delivery20,
			imppr.Delivery21,
			imppr.Delivery22,
			imppr.Delivery23,
			imppr.Delivery24,
			imppr.Delivery25,
			imppr.Delivery26,
			imppr.Delivery27,
			imppr.Delivery28,
			imppr.Delivery29,
			imppr.Delivery30,
			imppr.CreatorUserId
		from PrImportPrTemp imppr
		left join MstOrganizations oz on imppr.OrganizationCode = oz.Name
		left join MstSupplierSites sites on imppr.VendorSite = sites.VendorSiteCode and imppr.SupplierId = sites.SupplierId
		left join MstLocations locations on imppr.Location = locations.LocationCode
		left join MstGlCodeCombination glcom on imppr.BudgetCode = glcom.ConcatenatedSegments
		left join V_GetPartList part on imppr.ProductCode = part.PartNo
	  where imppr.IsDeleted = 0 and imppr.Remark is null
  ) tbl1
  UNPIVOT (
	Quanity
	for Temp in (
		Delivery1,
		Delivery2,
		Delivery3,
		Delivery4,
		Delivery5,
		Delivery6,
		Delivery7,
		Delivery8,
		Delivery9,
		Delivery10,
		Delivery11,
		Delivery12,
		Delivery13,
		Delivery14,
		Delivery15,
		Delivery16,
		Delivery17,
		Delivery18,
		Delivery19,
		Delivery20,
		Delivery21,
		Delivery22,
		Delivery23,
		Delivery24,
		Delivery25,
		Delivery26,
		Delivery27,
		Delivery28,
		Delivery29,
		Delivery30
		)
  ) AS unpivotData) imppr
  inner join 
  (
	select Temp, NeedBy, CreatorUserId
		from (
		select 
			impprDetail.Delivery1,
			impprDetail.Delivery2,
			impprDetail.Delivery3,
			impprDetail.Delivery4,
			impprDetail.Delivery5,
			impprDetail.Delivery6,
			impprDetail.Delivery7,
			impprDetail.Delivery8,
			impprDetail.Delivery9,
			impprDetail.Delivery10,
			impprDetail.Delivery11,
			impprDetail.Delivery12,
			impprDetail.Delivery13,
			impprDetail.Delivery14,
			impprDetail.Delivery15,
			impprDetail.Delivery16,
			impprDetail.Delivery17,
			impprDetail.Delivery18,
			impprDetail.Delivery19,
			impprDetail.Delivery20,
			impprDetail.Delivery21,
			impprDetail.Delivery22,
			impprDetail.Delivery23,
			impprDetail.Delivery24,
			impprDetail.Delivery25,
			impprDetail.Delivery26,
			impprDetail.Delivery27,
			impprDetail.Delivery28,
			impprDetail.Delivery29,
			impprDetail.Delivery30,
			impprDetail.CreatorUserId
		from PrImportPrDetailTemp impprDetail
		where impprDetail.IsDeleted = 0
  ) tbl1
  UNPIVOT (
	NeedBy
	for Temp in (
		Delivery1,
		Delivery2,
		Delivery3,
		Delivery4,
		Delivery5,
		Delivery6,
		Delivery7,
		Delivery8,
		Delivery9,
		Delivery10,
		Delivery11,
		Delivery12,
		Delivery13,
		Delivery14,
		Delivery15,
		Delivery16,
		Delivery17,
		Delivery18,
		Delivery19,
		Delivery20,
		Delivery21,
		Delivery22,
		Delivery23,
		Delivery24,
		Delivery25,
		Delivery26,
		Delivery27,
		Delivery28,
		Delivery29,
		Delivery30
	)
  ) AS unpivotData) impprDetail on imppr.Temp = impprDetail.Temp and imppr.CreatorUserId = impprDetail.CreatorUserId
 where isnull(imppr.Quanity, '0') != '0'