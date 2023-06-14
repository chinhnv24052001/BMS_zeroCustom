ALTER proc [dbo].[sp_PoGetPoLineForExportMulti]
	@PoHeaderId bigint
AS
BEGIN
	select distinct
			tbl1.ItemDescription As ProductName,
			col1 Mar02,
			col2 Mar07,
			col3 Mar13,
			col4 Mar17,
			tbl2.PartNo,
			Quanity,
			Unit,
			UnitPrice,
			Specification,
			Forcast1,
			Forcast2
		from (	select
			ItemDescription,
			col1,
			col2,
			col3,
			col4
		from 
			(select 
					lines.ItemDescription,lines.Quantity,
					'col' + cast(ROW_NUMBER() OVER(PARTITION BY lines.ItemDescription
					order by lines.id) as varchar) as col
				from PoLines lines 
				left join MstInventoryItems items on lines.ItemId = items.Id where lines.PoHeaderId = @PoHeaderId) t1
				pivot (
					sum(Quantity) for col in (col1,col2,col3,col4)   
				) t2) tbl1 
				inner join (
					select distinct
						lines.Id,
						lines.LineNum as LineNum,
						(items.PartNo + '.' + items.Color) as PartNo,
						lines.ItemDescription,
						sumQu.SumQuanity as Quanity,
						lines.UnitMeasLookupCode AS Unit,
						case when isnull(lines.UnitPrice, 0) <> 0 then FORMAT(isnull(lines.UnitPrice, 0), '#,#.00') else '0.00' end as UnitPrice,
						'' as Specification,
						case when isnull(lines.Quantity, 0) * isnull(lines.UnitPrice, 0) <> 0 then FORMAT(isnull(lines.Quantity, 0) * isnull(lines.UnitPrice, 0), '#,#.00') else '0.00' end as SubTotal,
						Attribute9 as Forcast1,
						Attribute12 as Forcast2,
						'' as Warranty
					from PoLines lines
					left join MstInventoryItems items on lines.ItemId = items.Id
					left join MstUnitOfMeasure uom on lines.UnitMeasLookupCode = uom.UnitOfMeasure
					left join (
						select ItemDescription, sum(Quantity) SumQuanity
						from PoLines
						where PoHeaderId = @PoHeaderId
						group by ItemDescription
					) sumQu on lines.ItemDescription = sumQu.ItemDescription
					where lines.PoHeaderId = @PoHeaderId
					and lines.IsDeleted = 0) tbl2 on tbl1.ItemDescription = tbl2.ItemDescription
END