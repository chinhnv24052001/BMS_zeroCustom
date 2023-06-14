ALTER PROC [dbo].[sp_CommonGetPartList]
	@PartNo varchar(50),
	@ItemsGroupId bigint,
	@SupplierId bigint,
	@DocumentDate datetime,
	@CurrencyCode varchar(50)
AS
	BEGIN
		
		select
			items.Id,
			items.InventoryItemId,
			items.InventoryGroupId,
			(items.PartNo + '.' + items.Color) PartNo,
			items.PartName,
			items.Color,
			items.PrimaryUnitOfMeasure,
			isnull(PRICE.UnitPrice, 0) AS UnitPrice,
			currency.CurrencyCode,
			SUP.SupplierName,
			items.SupplierId,
			case when isnull(groups.IsInventory, 0) = 0 then 'EXPENSE' else 'INVENTORY' end DestinationTypeCode
		from MstInventoryItems items
		left JOIN MstInventoryItemPrices PRICE ON items.Id = PRICE.InventoryItemId and PRICE.IsDeleted = 0
		left JOIN MstSuppliers SUP ON SUP.Id = items.SupplierId and SUP.IsDeleted = 0
		left join MstCurrency currency on currency.Id = items.CurrencyId
		left join MstInventoryGroup groups on items.InventoryGroupId = groups.Id
		where items.OrganizationId = 84 --default là 84
			and (PRICE.EffectiveFrom IS NULL OR PRICE.EffectiveFrom <= GETDATE())
			AND (PRICE.EffectiveTo IS NULL OR PRICE.EffectiveTo >= GETDATE())
			and items.IsDeleted = 0
			and items.IsActive = 1
			and (ISNULL(@PartNo, '') = '' OR UPPER(items.PartNo + '.' + items.Color) LIKE '%' + UPPER(@PartNo) + '%')
			and (isnull(@ItemsGroupId, 0) = 0 OR items.InventoryGroupId = @ItemsGroupId)
			and (isnull(@SupplierId, 0) = 0 OR items.SupplierId = @SupplierId)
			and (ISNULL(@CurrencyCode, '') = '' OR currency.CurrencyCode = @CurrencyCode)
	END