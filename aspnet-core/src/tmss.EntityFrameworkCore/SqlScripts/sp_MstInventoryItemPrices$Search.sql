ALTER proc [dbo].[sp_MstInventoryItemPrices$Search]
	@Keyword nvarchar(250),
	@InventoryGroupId bigint,
	@SupplierId bigint,
	@Page bigint,
	@PageSize bigint
as
begin
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
		price.EffectiveTo,-- Effective To
		count (price.id) over()  as TotalCount,
    item.PartNoCPS
	from MstInventoryItemPrices price
	inner join MstInventoryItems item on price.InventoryItemId = item.Id and item.OrganizationId = 84
	left join MstSuppliers supp on price.SupplierId = supp.Id
	left join MstCurrency curr on price.CurrencyId = curr.Id
	left join MstInventoryGroup invG on item.InventoryGroupId = invG.Id
	left join MstUnitOfMeasure uom on price.UnitOfMeasureId = uom.Id
	where item.PartNo like CONCAT( '%', @Keyword , '%')
		and (@InventoryGroupId =0 or item.InventoryGroupId = @InventoryGroupId)
		and (@SupplierId =0 or price.SupplierId = @SupplierId)
		and price.IsDeleted = 0
	order by item.PartNo,item.Color   
	OFFSET (@Page-1) * @PageSize ROWS
	FETCH FIRST @PageSize ROWS ONLY;
end