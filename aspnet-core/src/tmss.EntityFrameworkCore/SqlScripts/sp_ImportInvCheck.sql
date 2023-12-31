USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_ImportInvCheck]    Script Date: 4/9/2023 12:15:31 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_ImportInvCheck]
(@p_user_id BIGINT)
AS 
UPDATE V 
SET ERR = case when ms.Id is not NULL then null else 'Supplier Not Exists' end,
    SupplierId = ms.Id
FROM  TempCheckImportInvoice V
       LEFT JOIN MstSuppliers ms ON UPPER(MS.SupplierName) = UPPER(V.SupplierName)
       WHERE V.UserId = @p_user_id AND V.Err IS NULL
 
UPDATE  V 
SET ERR = case when po.Id is not NULL then null ELSE 'Order Not Exists' end, POHeaderId = po.Id
FROM  TempCheckImportInvoice V
LEFT JOIN PoHeaders po ON v.PONumber = po.Segment1 AND v.SupplierId = po.VendorId
 WHERE V.UserId = @p_user_id AND V.Err IS NULL
;

UPDATE V 
SET ERR = case when pl.Id IS NOT NULL THEN NULL ELSE 'Part Not Exists' end, ItemId = pl.ItemId ,
    v.POLineId = pl.Id, v.PartName = mii.PartName
FROM  TempCheckImportInvoice V
LEFT JOIN MstInventoryItems mii on UPPER(SUBSTRING(v.PartNo, 0, LEN(v.PartNo) - CHARINDEX(v.PartNo, '.') - 2)) = UPPER(mii.PartNo) and mii.OrganizationId = 84
LEFT JOIN PoLines pl ON pl.PoHeaderId = v.POHeaderId AND pl.ItemId = mii.Id
 WHERE V.UserId = @p_user_id AND V.Err IS NULL;
 

UPDATE  V 
SET ERR = 'Duplicate Data'
FROM TempCheckImportInvoice V inner join

(select  SupplierName, PONumber, PartNo FROM TempCheckImportInvoice
WHERE UserId = @p_user_id
group BY SupplierName, PONumber, PartNo
having count(*) >1) listDup ON v.SupplierName = listDup.SupplierName AND listDup.PONumber= v.PONumber AND v.PartNo = listDup.PartNo
 WHERE V.UserId = @p_user_id AND V.Err IS NULL;

UPDATE v set v.QtyRemain = ISNULL(rsl.QuantityReceived, po.QuantityPO) -ISNULL(remainInvoice.Quantity,0) ,
v.QtyGR = ISNULL(rsl.QuantityReceived,0) , v.QtyInv = ISNULL(remainInvoice.Quantity,0),
v.QtyPO = po.QuantityPO
 FROM  TempCheckImportInvoice v
 LEFT JOIN 
(SELECT sum(pl.Quantity) QuantityPO, v.ID  
FROM PoHeaders ph 
inner JOIN PoLines pl ON ph.Id = pl.PoHeaderId 
 inner JOIN TempCheckImportInvoice v ON v.POHeaderId = ph.Id and v.ItemId = pl.ItemId
   where v.UserId = @p_user_id
 group BY   v.ID) po
ON v.ID =po.id
LEFT JOIN 
(SELECT sum(rsl.QuantityReceived) QuantityReceived, v.ID  
FROM RcvShipmentLines rsl 
 inner JOIN TempCheckImportInvoice v ON v.POHeaderId = rsl.PoHeaderId and v.ItemId = rsl.ItemId
   where v.UserId = @p_user_id
 group BY  rsl.PoHeaderId,  rsl.ItemId, v.ID) rsl
ON v.ID =rsl.id
LEFT JOIN 
(
  SELECT invLines.PoHeaderId, invLines.ItemId, sum(invLines.Quantity) Quantity  
  from InvoiceLines invLines
  inner join InvoiceHeaders invHeaders  ON invLines.InvoiceId = invHeaders.Id
  inner JOIN TempCheckImportInvoice v on invHeaders.VendorId = v.SupplierId AND invLines.PoHeaderId = v.POHeaderId AND invLines.ItemId = v.ItemId
  where v.UserId = @p_user_id
  group BY invLines.PoHeaderId, invLines.ItemId
) remainInvoice ON   v.PoHeaderId = remainInvoice.PoHeaderId AND remainInvoice.ItemId = v.ItemId

UPDATE v set v.Err = 'Qty not Valid'
 FROM TempCheckImportInvoice v
WHERE ((v.Qty is not null  and v.Qty > isnull(v.QtyRemain, 0)) or v.Qty <0 OR  ISNULL(v.QtyRemain, 0) <= 0)
 and V.UserId = @p_user_id AND V.Err IS NULL ;

UPDATE v set v.Err = 'Unit Price not Valid'
		FROM TempCheckImportInvoice v
		WHERE (v.UnitPrice is not null  and  v.UnitPrice < 0)
		AND V.UserId = @p_user_id AND V.Err IS NULL;

UPDATE v SET v.UnitPrice = Tb1.UnitPrice
FROM TempCheckImportInvoice v
LEFT JOIN (SELECT
	POL.UnitPrice
	,PO.Segment1
FROM PoHeaders PO
INNER JOIN PoLines POL ON POL.PoHeaderId = PO.Id) Tb1 ON Tb1.Segment1 = v.PONumber WHERE v.UnitPrice IS NULL AND v.UserId = @p_user_id;

SELECT Err ErrDescription, PONumber, SupplierName, UnitPrice, Qty Quantity, QtyRemain QtyRemainGR,ItemId,
       QtyInv QtyInvoice, QtyGR QuantityReceived, QtyPO quantityOrder, PartName,PartName ItemDescription,PartNo,PartNo ItemNumber,SupplierId VendorId,POHeaderId, InvoicePrice
 FROM TempCheckImportInvoice WHERE UserId = @p_user_id;