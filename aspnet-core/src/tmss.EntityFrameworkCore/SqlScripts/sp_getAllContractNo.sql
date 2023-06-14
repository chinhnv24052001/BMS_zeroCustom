ALTER PROCEDURE [dbo].[sp_getAllContractNo] 
-- WITH ENCRYPTION, RECOMPILE, EXECUTE AS CALLER|SELF|OWNER| 'user_name'
AS
	SELECT 
		pct.ContractNo,
		appendix.AppendixNo as ContractAppendixNo
	FROM PrcContractTemplate pct
	inner join PrcAppendixContract appendix on pct.Id = appendix.ContractId
	WHERE pct.IsDeleted = 0
	and appendix.IsDeleted = 0