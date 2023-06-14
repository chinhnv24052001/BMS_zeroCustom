ALTER proc [dbo].[sp_MstInventoryItemPriceHistory$Search]
	@InventoryItemPriceId bigint 
as
begin
	declare @SupplierId bigint;
	declare @InventoryItemId bigint;
	select 
		@SupplierId = SupplierId,
		@InventoryItemId = InventoryItemId
	from MstInventoryItemPrices
	where Id = @InventoryItemPriceId;


	select 
		price.Id,
		item.PartNo, --Part No
		item.Color, -- Color
		item.PartName, -- Part Name
		price.PartNameSupplier, -- Supplier Part Name
		supp.SupplierName, -- Supplier Name
		curr.CurrencyCode, -- Currency
		price.UnitPrice, -- Unit Price
		price.TaxPrice,-- Tax Price
		price.EffectiveFrom, -- Effective From
		price.EffectiveTo-- Effective To
		 
	from MstInventoryItemPriceHistory price
	inner join MstInventoryItems item on price.InventoryItemId = item.Id
	inner join MstSuppliers supp on price.SupplierId = supp.Id
	inner join MstCurrency curr on price.CurrencyId = curr.Id
	left join MstInventoryGroup invG on item.InventoryGroupId = invG.Id
	left join MstUnitOfMeasure uom on price.UnitOfMeasureId = uom.Id
	where  price.SupplierId  = @SupplierId 
		and  price.InventoryItemId  = @InventoryItemId 
	order by price.EffectiveFrom   
 
end
