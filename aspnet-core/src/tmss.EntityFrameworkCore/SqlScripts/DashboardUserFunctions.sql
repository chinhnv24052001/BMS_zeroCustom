CREATE TABLE DashboardUserFunctions(
	Id BIGINT NOT NULL PRIMARY KEY,
	UserId BIGINT NOT NULL,
	FunctionId BIGINT NOT NULL,
	Ordering INT NOT NULL,
	CreationTime DATETIME2(7) NOT NULL,
	CreatorUserId BIGINT NULL,
	LastModificationTime DATETIME2(7) NULL,
	LastModifierUserId BIGINT NULL,
	DeleterUserId BIGINT NULL,
	DeletionTime DATETIME2(7),
	IsDeleted BIT NOT NULL
);