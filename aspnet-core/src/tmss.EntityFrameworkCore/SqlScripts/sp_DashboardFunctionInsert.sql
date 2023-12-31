USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_DashboardFunctionInsert]    Script Date: 4/23/2023 3:58:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_DashboardFunctionInsert]
(
	@UserId BIGINT,
	@FunctionId BIGINT,
	@Ordering INT
)
AS
BEGIN
	INSERT INTO DashboardUserFunctions(UserId, FunctionId, Ordering, CreatorUserId, CreationTime, IsDeleted)
	VALUES (@UserId, @FunctionId, @Ordering, @UserId, GETDATE(), 0)
END;
