using Abp;
using Abp.Application.Services.Dto;
using Abp.Authorization;
using Abp.Authorization.Users;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Abp.UI;
using GemBox.Spreadsheet;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.Authorization;
using tmss.Authorization.Users;
using tmss.Common;
using tmss.EntityFrameworkCore;
using tmss.Master.HrOrgStructure;
using tmss.Master.InventoryGroup;
using tmss.Master.InventoryGroup.Dto;
using tmss.Master.MstQuotaExpense.DTO;
using tmss.Master.UnitOfMeasure.Dto;

namespace tmss.Master
{
    public class MstInventoryGroupAppService : tmssAppServiceBase, IMstInventoryGroupAppService
    {
        private readonly IRepository<MstInventoryGroup, long> _mstInventoryGroupRepository;
        private readonly IRepository<MstHrOrgStructure, Guid> _mstHrOrgStructureRepository;
        private readonly IRepository<MstTitles, long> _mstTitleRepository;
        private readonly IRepository<MstProductGroup, long> _mstProductGroupRepository;
        private readonly IRepository<MstGlCodeCombination, long> _glCombinationRepo;
        private readonly IRepository<User, long> _userRepository;
        private readonly IMstHrOrgStructureAppService _iMstHrOrgStructureAppService;
        private readonly IDapperRepository<User, long> _dapper;


        public MstInventoryGroupAppService(
            IRepository<MstInventoryGroup, long> mstInventoryGroupRepository,
            IRepository<User, long> userRepository,
            IRepository<MstHrOrgStructure, Guid> mstHrOrgStructureRepository,
            IMstHrOrgStructureAppService iMstHrOrgStructureAppService,
            IDapperRepository<User, long> dapper,
            IRepository<MstTitles, long> mstTitleRepository,
            IRepository<MstProductGroup, long> mstProductGroupRepository,
            IRepository<MstGlCodeCombination, long> glCombinationRepo
            )
        {
            _mstInventoryGroupRepository = mstInventoryGroupRepository;
            _mstHrOrgStructureRepository = mstHrOrgStructureRepository;
            _userRepository = userRepository;
            _iMstHrOrgStructureAppService = iMstHrOrgStructureAppService;
            _dapper = dapper;
            _mstTitleRepository = mstTitleRepository;
            _mstProductGroupRepository = mstProductGroupRepository;
            _glCombinationRepo = glCombinationRepo;
        }
        public async Task<List<GetMstInventoryGroupDto>> getAllInventoryGroup()
        {
            var listInventoryGroup = from listInventory in _mstInventoryGroupRepository.GetAll().AsNoTracking()
                                     select new GetMstInventoryGroupDto()
                                     {
                                         Id = listInventory.Id,
                                         ProductGroupCode = listInventory.ProductGroupCode,
                                         ProductGroupName = listInventory.ProductGroupName,
                                         IsInventory = listInventory.IsInventory,
                                     };

            return listInventoryGroup.ToList();
        }
        [AbpAuthorize(AppPermissions.InventoryGroup_Search)]
        public async Task<PagedResultDto<MstInventoryGroupDto>> getAll(FilterMstInventoryGroup filter)
        {
            var listInventoryGroup = from item in _mstInventoryGroupRepository.GetAll().AsNoTracking()
                                     join dp in _mstHrOrgStructureRepository.GetAll().AsNoTracking() on item.PicDepartmentId equals dp.Id into dpJoined
                                     from dp in dpJoined.DefaultIfEmpty()
                                     join dp1 in _mstHrOrgStructureRepository.GetAll().AsNoTracking() on item.PurchaDepartmentId equals dp1.Id into dp1Joind
                                     from dp1 in dp1Joind.DefaultIfEmpty()
                                     join dp2 in _mstHrOrgStructureRepository.GetAll().AsNoTracking() on item.DeliDepartmentId equals dp2.Id into dp2Joind
                                     from dp2 in dp2Joind.DefaultIfEmpty()
                                     join prd in _mstProductGroupRepository.GetAll().AsNoTracking() on item.ProductGroupId equals prd.Id into prdJoind
                                     from prd in prdJoind.DefaultIfEmpty()
                                     where ((string.IsNullOrWhiteSpace(filter.IventoryGroupCode) || item.ProductGroupCode.Contains(filter.IventoryGroupCode))
                                         && (string.IsNullOrWhiteSpace(filter.IventoryGroupName) || item.ProductGroupName.Contains(filter.IventoryGroupName)))
                                     select new MstInventoryGroupDto
                                     {
                                         Id = item.Id,
                                         ProductGroupCode = item.ProductGroupCode,
                                         ProductGroupName = item.ProductGroupName,
                                         PicDepartmentId = item.PicDepartmentId.ToString(),
                                         PurchaDepartmentId = item.PurchaDepartmentId.ToString(),
                                         IsCatalog = item.IsCatalog,
                                         DepartmentName = dp.Name,
                                         PurchaDepartmentName = dp1.Name,
                                         DeliDepartmentName = dp2.Name,
                                         ProductName = prd.ProductGroupName,
                                         Description = item.Description,
                                         IsInventory = item.IsInventory,
                                         UR = item.UR,
                                         PR = item.PR,
                                         PO = item.PO, 
                                         Status = item.Status == "Y" ? AppConsts.Active : AppConsts.InActive
                                     };

            var result = listInventoryGroup;
            return new PagedResultDto<MstInventoryGroupDto>(
                       listInventoryGroup.Count(),
                       result.ToList()
                      );
        }
        // edit inventory group
        public async Task<MstInventoryGroupDto> getInventoryGroupById(long id)
        {
            var inventoryGroup = _mstInventoryGroupRepository.FirstOrDefault(r => r.Id == id);
            // map to dto 
            MstInventoryGroupDto result = ObjectMapper.Map<MstInventoryGroupDto>(inventoryGroup);
            result.listUser = await _iMstHrOrgStructureAppService.GetListUserByHrOrg(inventoryGroup.PicDepartmentId.ToString(), 0);

            return result;
        }
        // create or edit inventory group
        [AbpAuthorize(AppPermissions.InventoryGroup_Edit, AppPermissions.InventoryGroup_Add)]
        public async Task<ValInventoryGroupDto> CreateOrEdit(MstInventoryGroupDto input)
        {
            ValInventoryGroupDto result = new ValInventoryGroupDto();

            if (input.Id == 0)
            {
                //Check duplicate for create
                var mstInventory1 = await _mstInventoryGroupRepository.FirstOrDefaultAsync(e => e.ProductGroupName.Equals(input.ProductGroupName));
                result.Name = mstInventory1 != null ? AppConsts.DUPLICATE_NAME : null;

                var mstInventory2 = await _mstInventoryGroupRepository.FirstOrDefaultAsync(e => e.ProductGroupCode.Equals(input.ProductGroupCode));
                result.Code = mstInventory2 != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Name != null || result.Code != null)
                {
                    return result;
                }
                else
                {
                    var checkBudgetCode = await _glCombinationRepo.FirstOrDefaultAsync(e => e.ConcatenatedSegments == input.BudgetCode);
                    if (checkBudgetCode == null)
                    {
                        throw new UserFriendlyException(400, L("CannotFindBudgetCode"));
                    }
                    else {
                        var inventoryGroup = ObjectMapper.Map<MstInventoryGroup>(input);
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(inventoryGroup);
                    }
                }
            }
            else
            {
                //Check duplicate for edit
                var mstInventory1 = await _mstInventoryGroupRepository.FirstOrDefaultAsync(e => e.ProductGroupName.Equals(input.ProductGroupName) && e.Id != input.Id);
                result.Name = mstInventory1 != null ? AppConsts.DUPLICATE_NAME : null;

                var mstInventory2 = await _mstInventoryGroupRepository.FirstOrDefaultAsync(e => e.ProductGroupCode.Equals(input.ProductGroupCode) && e.Id != input.Id);
                result.Code = mstInventory2 != null ? AppConsts.DUPLICATE_CODE : null;
                if (result.Name != null || result.Code != null)
                {
                    return result;
                }
                else
                {
                    var checkBudgetCode = await _glCombinationRepo.FirstOrDefaultAsync(e => e.ConcatenatedSegments == input.BudgetCode);
                    if (checkBudgetCode == null)
                    {
                        throw new UserFriendlyException(400, L("CannotFindBudgetCode"));
                    }
                    else
                    {
                        var checkExits = await _mstInventoryGroupRepository.FirstOrDefaultAsync(e => e.Id == input.Id);

                        if (checkExits == null) throw new UserFriendlyException(400, L("DataIsNotExisted"));
                        else
                        {
                            ObjectMapper.Map(input, checkExits);
                        }
                    }
                    
                }
            }

            return result;
        }
        // delete inventory group
        [AbpAuthorize(AppPermissions.InventoryGroup_Delete)]
        public async Task deleteInventoryGroup(long id)
        {
            await _mstInventoryGroupRepository.DeleteAsync(id);
        }

        public async Task<List<MasterLookupDto>> getAllMstHr()
        {
            string _sql = "EXEC sp_MstHrOrgStructureGetAll";
            var list = (await _dapper.QueryAsync<MasterLookupDto>(_sql)).ToList();

            return list;
        }

        public async Task<List<MasterLookupDto>> getAllProductGroup()
        {
            string _sql = "EXEC sp_MstGetAllProductGroup";
            var list = (await _dapper.QueryAsync<MasterLookupDto>(_sql)).ToList();

            return list;
        }

        [AbpAuthorize(AppPermissions.ProductManagement_Export)]
        public async Task<byte[]> MstInventoryGroupExportExcel(InputMstInventoryGroupExportDto input)
        {

            var listInventoryGroup = from item in _mstInventoryGroupRepository.GetAll().AsNoTracking()
                                     join dp in _mstHrOrgStructureRepository.GetAll().AsNoTracking() on item.PicDepartmentId equals dp.Id into dpJoined
                                     from dp in dpJoined.DefaultIfEmpty()
                                     join dp1 in _mstHrOrgStructureRepository.GetAll().AsNoTracking() on item.PurchaDepartmentId equals dp1.Id into dp1Joind
                                     from dp1 in dp1Joind.DefaultIfEmpty()
                                     join dp2 in _mstHrOrgStructureRepository.GetAll().AsNoTracking() on item.DeliDepartmentId equals dp2.Id into dp2Joind
                                     from dp2 in dp2Joind.DefaultIfEmpty()
                                     join prd in _mstProductGroupRepository.GetAll().AsNoTracking() on item.ProductGroupId equals prd.Id into prdJoind
                                     from prd in prdJoind.DefaultIfEmpty()
                                     where ((string.IsNullOrWhiteSpace(input.IventoryGroupCode) || item.ProductGroupCode.Contains(input.IventoryGroupCode))
                                         && (string.IsNullOrWhiteSpace(input.IventoryGroupName) || item.ProductGroupName.Contains(input.IventoryGroupName)))
                                     select new MstInventoryGroupDto
                                     {
                                         Id = item.Id,
                                         ProductGroupCode = item.ProductGroupCode,
                                         ProductGroupName = item.ProductGroupName,
                                         PicDepartmentId = item.PicDepartmentId.ToString(),
                                         PurchaDepartmentId = item.PurchaDepartmentId.ToString(),
                                         IsCatalog = item.IsCatalog,
                                         DepartmentName = dp.Name,
                                         PurchaDepartmentName = dp1.Name,
                                         DeliDepartmentName = dp2.Name,
                                         ProductName = prd.ProductGroupName,
                                         Description = item.Description,
                                         IsInventory = item.IsInventory,
                                         UR = item.UR,
                                         PR = item.PR,
                                         PO = item.PO,
                                         Status = item.Status == "Y" ? AppConsts.Active : AppConsts.InActive
                                     };
            var result = listInventoryGroup.ToList();
            SpreadsheetInfo.SetLicense("EF21-1FW1-HWZF-CLQH");
            var xlWorkBook = new ExcelFile();
            var v_worksheet = xlWorkBook.Worksheets.Add("Book1");

            var v_list_export_excel = result.ToList();
            List<string> list = new List<string>();
            list.Add("ProductName");
            list.Add("ProductGroupCode");
            list.Add("ProductGroupName");
            list.Add("DepartmentName");
            list.Add("PurchaDepartmentName");
            list.Add("DeliDepartmentName");
            list.Add("Description");
            list.Add("Status");
            list.Add("IsCatalog");
            list.Add("IsInventory");
            list.Add("UR");
            list.Add("PR");
            list.Add("PO");


            List<string> listHeader = new List<string>();
            listHeader.Add("Category");
            listHeader.Add("Product Group Code");
            listHeader.Add("Product Group Name");
            listHeader.Add("Operation Department");
            listHeader.Add("Purchasing Department");
            listHeader.Add("Delivery Department");
            listHeader.Add("Description");
            listHeader.Add("Status");
            listHeader.Add("IsCatalog");
            listHeader.Add("IsInventory");
            listHeader.Add("UR");
            listHeader.Add("PR");
            listHeader.Add("PO");

            string[] properties = list.ToArray();
            string[] p_header = listHeader.ToArray();
            Commons.FillExcel(v_list_export_excel, v_worksheet, 1, 0, properties, p_header);

            var tempFile = Path.Combine(Path.GetTempPath(), Guid.NewGuid() + ".xlsx");
            xlWorkBook.Save(tempFile);
            var tempFile2 = Commons.SetAutoFit(tempFile, p_header.Length);
            byte[] fileByte = await File.ReadAllBytesAsync(tempFile2);
            File.Delete(tempFile);
            File.Delete(tempFile2);
            return fileByte;
        }
    }
}
