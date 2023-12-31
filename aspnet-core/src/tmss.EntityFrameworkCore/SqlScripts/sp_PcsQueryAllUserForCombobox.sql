USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_PcsQueryAllUserForCombobox]    Script Date: 4/14/2023 7:57:34 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

ALTER PROCEDURE [dbo].[sp_PcsQueryAllUserForCombobox]
WITH RECOMPILE
AS
BEGIN
	SELECT
		Id
		,Name + ' - ' + EmailAddress AS UserNameAndEmail
	FROM AbpUsers
	WHERE IsDeleted = 0 AND IsActive = 1
END;