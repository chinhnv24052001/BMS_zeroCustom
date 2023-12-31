USE [CPS]
GO
/****** Object:  StoredProcedure [dbo].[sp_MstSuppliers$Insert]    Script Date: 4/18/2023 3:12:24 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
ALTER proc [dbo].[sp_MstSuppliers$Insert]
	@SupplierRequestId bigint,
	@CreatorUserId bigint

as
begin
	BEGIN TRY
		BEGIN TRANSACTION
			declare @count int;
			declare @VatRegistrationNum nvarchar(max);

			select 
				@VatRegistrationNum = TaxRegistrationNumber
			from MstSupplierRequest
			where id = @SupplierRequestId;



			select @count = count(id)
			from MstSuppliers
			where VatRegistrationNum =@VatRegistrationNum;
			if (@count >0)
			begin
				RAISERROR ('Tax Registration Number is duplicate!',16,1 );
			end;

			insert into MstSuppliers
			(
				SupplierName,
				VatRegistrationNum,
				VatRegistrationInvoice,
				AbbreviateName,
				Status,
				CreatorUserId,
				CreationTime,
				IsDeleted
			)
			select 
				SupplierName,
				TaxRegistrationNumber,
				TaxRegistrationNumber,
				AbbreviateName,
				'Qualified',
				@CreatorUserId,
				getdate(),
				0
			from MstSupplierRequest
			where id = @SupplierRequestId;

			declare @SupplierId bigint;
			SELECT @SupplierId= SCOPE_IDENTITY();

			insert into MstSupplierSites
			(
				SupplierId,
				VendorSiteCode,
				AddressLine1,
				CreatorUserId,
				CreationTime,
				IsDeleted
			)
			select 
				@SupplierId,
				Location,
				Address ,
				@CreatorUserId,
				getdate(),
				0
			from MstSupplierRequest
			where id = @SupplierRequestId;

			declare @SupplierSiteId bigint;
			SELECT @SupplierSiteId= SCOPE_IDENTITY();

			insert into MstSupplierBankAccount
			(
				SupplierId,
				SupplierSiteId,
				BankAccountName,
				BankName,
				BankAccountNum,
				CurrencyId,
				IsPrimary,
				CreatorUserId,
				CreationTime,
				IsDeleted
			)
			select 
				@SupplierId,
				@SupplierSiteId,
				BeneficiaryName,
				BankName,
				BeneficiaryAccount,
				isnull(CurrencyId,7),
				1,
				@CreatorUserId,
				getdate(),
				0
			from MstSupplierRequest
			where id = @SupplierRequestId;

			declare @FirstName nvarchar(50);
			declare @MiddleName nvarchar(50);
			declare @LastName nvarchar(50);
			select  
			   @FirstName = parsename(replace(ConntactPerson1, ' ', '.'), 3) ,
			   @MiddleName = parsename(replace(ConntactPerson1, ' ', '.'), 2),
			   @LastName = parsename(replace(ConntactPerson1, ' ', '.'), 1)  
			from MstSupplierRequest
			where id = @SupplierRequestId;

			insert into MstSupplierContacts
			(
				 
				SupplierSiteId,
				SupplierId,
				FirstName,
				MidName,
				LastName,
				Phone,
				EmailAddress,
				CreatorUserId,
				CreationTime,
				IsDeleted
			)
			select 
				@SupplierSiteId,
				@SupplierId,
				@FirstName,
				@MiddleName,
				@LastName,
				isnull(ContactMobile1,''),
				ContactEmail1,
				@CreatorUserId,
				getdate(),
				0
			from MstSupplierRequest
			where id = @SupplierRequestId;

			select SCOPE_IDENTITY() as SupContactId, (@FirstName + @MiddleName) as ContactSurName;
			

			update MstSupplierRequest
			set TransferStatus= 'done'
			where id = @SupplierRequestId;

			
		COMMIT TRANSACTION 
	END TRY
	BEGIN CATCH
		ROLLBACK TRANSACTION;
		DECLARE @Message varchar(MAX) = ERROR_MESSAGE(),
			@Severity int = ERROR_SEVERITY(),
			@State smallint = ERROR_STATE();
 
		RAISERROR (@Message, @Severity, @State);
	END CATCH
end;
