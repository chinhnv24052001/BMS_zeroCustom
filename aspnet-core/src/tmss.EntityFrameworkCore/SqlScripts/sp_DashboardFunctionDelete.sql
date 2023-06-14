USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_DashboardFunctionDelete]    Script Date: 4/23/2023 3:58:22 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE PROCEDURE [dbo].[sp_DashboardFunctionDelete]
(
	@UserId BIGINT
)
AS
BEGIN
	DELETE DashboardUserFunctions WHERE UserId = @UserId
END;
