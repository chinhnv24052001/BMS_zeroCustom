ALTER view [dbo].[V_GetPartList]
AS
		--select distinct
		--	items.Id,
		--	items.InventoryGroupId,
		--	(items.PartNo + '.' + items.Color) PartNo,
		--	items.PartName,
		--	items.Color,
		--	attr.UserAttributeName, 
		--	PRICE.UnitPrice AS UnitPrice,
		--	'' as OrganizationCodeDsp,
		--	cate.Category_Concat_Segs Category,
		--	cate.CategoryId,
		--	cate.Segment1,
		--	cate.Segment2,
		--	items.PrimaryUnitOfMeasure,
		--	cate.CategorySetname,
		--	items.CurrencyId,
		--	currency.CurrencyCode
		--from MstInventoryItems items
		--left join MstInventoryItemAttributes attr on items.InventoryItemId = attr.InventoryItemId
		--inner join MstInventoryItemCategories cate on items.InventoryItemId = cate.InventoryItemId
		--left JOIN MstInventoryItemPrices PRICE ON items.Id = PRICE.InventoryItemId
		--left JOIN MstSuppliers SUP ON SUP.Id = PRICE.SupplierId
		--inner join MstCurrency currency on items.CurrencyId = currency.Id
		--where UserAttributeName = 'List Price'
		--	and items.OrganizationId = 21 --default là 21
		--	AND (SUP.StartDateActive IS NULL OR SUP.StartDateActive <= GETDATE())
		--	AND (SUP.EndDateActive IS NULL OR SUP.EndDateActive >= GETDATE())

		select
			items.Id,
			items.InventoryItemId,
			items.InventoryGroupId,
			(items.PartNo + '.' + items.Color) PartNo,
			items.PartName,
			items.Color,
			items.PrimaryUnitOfMeasure,
			PRICE.UnitPrice AS UnitPrice,
			items.CurrencyId,
			currency.CurrencyCode,
			case when isnull(grous.IsInventory, 0) = 0 then 'INVENTORY' else 'EXPENSE' end DestinationTypeCode
		from MstInventoryItems items
		left JOIN MstInventoryItemPrices PRICE ON items.Id = PRICE.InventoryItemId and items.CurrencyId = PRICE.CurrencyId and PRICE.IsDeleted = 0
		left JOIN MstSuppliers SUP ON SUP.Id = PRICE.SupplierId and SUP.IsDeleted = 0
		left join MstCurrency currency on items.CurrencyId = currency.Id and currency.IsDeleted = 0
		left join MstInventoryGroup grous on items.InventoryGroupId = grous.Id
		where items.OrganizationId = 84 --default là 84
			and (PRICE.EffectiveFrom IS NULL OR PRICE.EffectiveFrom <= GETDATE())
			AND (PRICE.EffectiveTo IS NULL OR PRICE.EffectiveTo >= GETDATE())
			and items.IsDeleted = 0
GO