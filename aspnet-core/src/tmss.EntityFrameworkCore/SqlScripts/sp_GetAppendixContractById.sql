USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_GetAppendixContractById]    Script Date: 4/21/2023 10:55:46 AM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER PROCEDURE [dbo].[sp_GetAppendixContractById] 
(
	@p_id BIGINT
)
AS
BEGIN
      SELECT b.Id, b.AppendixNo, b.EffectiveFrom, b.EffectiveTo, b.ApprovalStatus, b.Description,
       b.TotalAmount, b.ContractId,b.AppendixDate,pct.ContractNo,ms.SupplierName ,ms.Id as SupplierId
       FROM PrcAppendixContract b
       INNER JOIN PrcContractTemplate pct ON b.ContractId = pct.Id
       left JOIN MstSuppliers ms on ms.Id = pct.SupplierId
       WHERE b.Id=@p_id
END
