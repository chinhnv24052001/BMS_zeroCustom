using Abp.Application.Services;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using Abp.UI;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;
using System.Threading.Tasks;
using tmss.Common.GeneratePurchasingNumber;
using tmss.EntityFrameworkCore;
using tmss.GR.Enum;
using tmss.Master;

namespace tmss.Common
{
    public class CommonGeneratePurchasingNumberAppService : ApplicationService, ICommonGeneratePurchasingNumberAppService
    {
        private readonly IRepository<MstLastPurchasingSeq, long> _seqRepo;

        public CommonGeneratePurchasingNumberAppService(
            IRepository<MstLastPurchasingSeq, long> seqRepo
            )
        {
            _seqRepo = seqRepo;
        }

        public async Task<string> GenerateRequestNumber(GenSeqType type)
        {
            int num = 0;
            MstLastPurchasingSeq lastReqSeq = await _seqRepo.GetAll().Where(e => e.Type == type).OrderByDescending(e => e.Id).FirstOrDefaultAsync();
            if (lastReqSeq != null)
            {
                num = lastReqSeq.LastRequestDate.Month == DateTime.Now.Month ? (lastReqSeq.LastSeq + 1) : 1;
                lastReqSeq.LastRequestDate = DateTime.Now;
                lastReqSeq.LastSeq = num;
            }
            else
            {
                num = 1;
                MstLastPurchasingSeq newLastOrderNo = new MstLastPurchasingSeq
                {
                    LastSeq = num,
                    LastRequestDate = DateTime.Now,
                    Type = type
                };
                await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(newLastOrderNo);
            }
            string prefix = type == GenSeqType.UserRequest ? "UR" 
                : type == GenSeqType.PurchasingRequest ? "PR" 
                : type == GenSeqType.PurchasingOrder ? "PO"
                : type == GenSeqType.Annex ? "AN" 
                : type == GenSeqType.SupplierRequest ? "SR" 
                : type == GenSeqType.PaymentRequest ? "PM"
                : type == GenSeqType.ContractBackdate ? "BD"
                : "";

            string currentDateToGen = "";

            if (AppConsts.PO.Equals(prefix) || AppConsts.PR.Equals(prefix))
            {
                currentDateToGen = $"{DateTime.Now.Month:00}{DateTime.Now.Date.Year.ToString()}";
            }
            else
            {
                currentDateToGen = $"{DateTime.Now.Month:00}{DateTime.Now.Date.Year.ToString().Substring(2, 2)}";
            }
           
            string newOrderNo = $"{prefix}-{currentDateToGen}-{num.ToString("0000")}";
            if (string.IsNullOrWhiteSpace(newOrderNo)) throw new UserFriendlyException(400, L("CanNotGenPcsNum"));
            return newOrderNo;
        }
    }
}
