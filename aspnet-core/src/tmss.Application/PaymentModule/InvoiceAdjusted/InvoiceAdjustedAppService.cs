using Abp.Application.Services.Dto;
using Abp.Dapper.Repositories;
using Abp.Domain.Repositories;
using Abp.EntityFrameworkCore.Uow;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.EntityFrameworkCore;
using tmss.PaymentModule.InvoiceAdjusted.Dto;
using tmss.PaymentModule.Invoices;
using tmss.PaymentModule.Payment;
using tmss.PaymentModule.Prepayment;
using tmss.PR;
using tmss.PR.PurchasingRequest.Dto;

namespace tmss.PaymentModule.InvoiceAdjusted
{
    public class InvoiceAdjustedAppService : tmssAppServiceBase, IInvoiceAdjustedAppService
    {

        private readonly IRepository<InvoiceAdjustedHeaders, long> _repositoryInvoiceAdjustedHeaders;
        private readonly IRepository<InvoiceAdjustedLines, long> _repositoryInvoiceAdjustedLines;
        private readonly IRepository<InvoiceHeaders, long> _repositoryInvoiceHeaders;
        private readonly IRepository<InvoiceLines, long> _repositoryInvoiceLines;
        private readonly IDapperRepository<PrRequisitionHeaders, long> _spRepository;

        public InvoiceAdjustedAppService(
            IRepository<InvoiceAdjustedLines, long> repositoryInvoiceAdjustedLines,
            IRepository<InvoiceAdjustedHeaders, long> repositoryInvoiceAdjustedHeaders,
            IDapperRepository<PrRequisitionHeaders, long> spRepository,
            IRepository<InvoiceHeaders, long> repositoryInvoiceHeaders,
            IRepository<InvoiceLines, long> repositoryInvoiceLines)
        {
            _repositoryInvoiceAdjustedHeaders = repositoryInvoiceAdjustedHeaders;
            _repositoryInvoiceAdjustedLines = repositoryInvoiceAdjustedLines;
            _spRepository = spRepository;
            _repositoryInvoiceHeaders = repositoryInvoiceHeaders;
            _repositoryInvoiceLines = repositoryInvoiceLines;
        }

        public async Task<long> CreateOrEditInvoiceAdjusted(InputInvoiceAdjustedHeadersDto inputInvoiceAdjustedHeadersDto)
        {
            if (inputInvoiceAdjustedHeadersDto.Id > 0)
            {
                InvoiceAdjustedHeaders invoiceAdjustedHeaders = _repositoryInvoiceAdjustedHeaders.FirstOrDefault(p => p.Id == inputInvoiceAdjustedHeadersDto.Id);
                invoiceAdjustedHeaders = ObjectMapper.Map(inputInvoiceAdjustedHeadersDto, invoiceAdjustedHeaders);
                await InsertOrUpdateInvoiceAdjustedLines(inputInvoiceAdjustedHeadersDto, invoiceAdjustedHeaders.Id);
                return invoiceAdjustedHeaders.Id;
            } else
            {
                InvoiceAdjustedHeaders invoiceAdjustedHeaders = new InvoiceAdjustedHeaders();
                invoiceAdjustedHeaders = ObjectMapper.Map<InvoiceAdjustedHeaders>(inputInvoiceAdjustedHeadersDto);
                await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(invoiceAdjustedHeaders);
                await CurrentUnitOfWork.SaveChangesAsync();

                await InsertOrUpdateInvoiceAdjustedLines(inputInvoiceAdjustedHeadersDto, invoiceAdjustedHeaders.Id);
                return invoiceAdjustedHeaders.Id;
            }
        }

        private async Task InsertOrUpdateInvoiceAdjustedLines(InputInvoiceAdjustedHeadersDto inputInvoiceAdjustedHeadersDto, long headerId)
        {
            if (inputInvoiceAdjustedHeadersDto.inputInvoiceAdjustedLinesDtos != null)
            {
                foreach (InputInvoiceAdjustedLinesDto inputInvoiceAdjustedLinesDto in inputInvoiceAdjustedHeadersDto.inputInvoiceAdjustedLinesDtos)
                {
                    if (inputInvoiceAdjustedLinesDto.Id > 0)
                    {
                        InvoiceAdjustedLines invoiceAdjustedLines = _repositoryInvoiceAdjustedLines.FirstOrDefault(p => p.Id == inputInvoiceAdjustedLinesDto.Id);
                        invoiceAdjustedLines.InvAdjustedHeadersId = headerId;
                        invoiceAdjustedLines = ObjectMapper.Map(inputInvoiceAdjustedLinesDto, invoiceAdjustedLines);
                    } else
                    {
                        InvoiceAdjustedLines invoiceAdjustedLines = new InvoiceAdjustedLines();
                        invoiceAdjustedLines = ObjectMapper.Map(inputInvoiceAdjustedLinesDto, invoiceAdjustedLines);
                        invoiceAdjustedLines.InvAdjustedHeadersId = headerId;
                        await CurrentUnitOfWork.GetDbContext<tmssDbContext>().AddAsync(invoiceAdjustedLines);
                    }
                }
            }
        }

        public Task deleteInvoiceAdjusted(long? id)
        {
            throw new NotImplementedException();
        }

        public async Task<InputInvoiceAdjustedHeadersDto> getInvoiceAdjestedId(long? id)
        {
            InputInvoiceAdjustedHeadersDto inputInvoiceAdjustedHeadersDto = new InputInvoiceAdjustedHeadersDto();
            InputInvoiceAdjustedLinesDto inputInvoiceAdjustedLinesDto = new InputInvoiceAdjustedLinesDto();
            List<InputInvoiceAdjustedLinesDto> inputInvoiceAdjustedLinesDtos = new List<InputInvoiceAdjustedLinesDto>();
            InvoiceAdjustedHeaders invoiceAdjustedHeaders = _repositoryInvoiceAdjustedHeaders.FirstOrDefault(p => p.Id == id);
            inputInvoiceAdjustedHeadersDto = ObjectMapper.Map<InputInvoiceAdjustedHeadersDto>(invoiceAdjustedHeaders);

            List<InvoiceAdjustedLines> invoiceAdjustedLines = _repositoryInvoiceAdjustedLines.GetAll().Where(p => p.InvAdjustedHeadersId == id).ToList();
            foreach (InvoiceAdjustedLines invoiceAdjustedline in invoiceAdjustedLines)
            {
                inputInvoiceAdjustedLinesDtos.Add(ObjectMapper.Map<InputInvoiceAdjustedLinesDto>(invoiceAdjustedline));
            }
            inputInvoiceAdjustedHeadersDto.inputInvoiceAdjustedLinesDtos = inputInvoiceAdjustedLinesDtos;
            return inputInvoiceAdjustedHeadersDto;
        }

        public async Task<PagedResultDto<GetAllInvoiceAdjustedDto>> getAllInvoiceAdjusted(InputSearchInvoiceAdjustedDto inputSearchInvoiceAdjustedDto)
        {
            string _sql = "EXEC sp_InvSearchInvoiceAjusted @InvoiceNo, @SerialNo, @SupplierId, @MaxResultCount, @SkipCount";
            var listinv = await _spRepository.QueryAsync<GetAllInvoiceAdjustedDto>(_sql, new
            {
                @InvoiceNo = inputSearchInvoiceAdjustedDto.InvoiceNo,
                @SerialNo = inputSearchInvoiceAdjustedDto.SerialNo,
                @SupplierId = inputSearchInvoiceAdjustedDto.SupplierId,
                @MaxResultCount = inputSearchInvoiceAdjustedDto.MaxResultCount,
                @SkipCount = inputSearchInvoiceAdjustedDto.SkipCount,
            });

            int totalCount = 0;
            if (listinv != null && listinv.Count() > 0)
            {
                totalCount = (int)listinv.ToList()[0].TotalCount;
            }
            return new PagedResultDto<GetAllInvoiceAdjustedDto>(
                       totalCount,
                       listinv.ToList()
                      );
        }

        public async Task<List<GetListInvoiceHeadersDto>> getListInvoiceHeadersByVendorId(long vendorId)
        {
            var listInvoice = from inv in _repositoryInvoiceHeaders.GetAll().Where(p => p.VendorId == vendorId)
                              select new GetListInvoiceHeadersDto()
                              {
                                  Id = inv.Id,
                                  InvoiceDate = inv.InvoiceDate,
                                  InvoiceNo = inv.InvoiceNum,
                                  SerialNo = inv.InvoiceSymbol
                              };
            return listInvoice.ToList();
        }

        public async Task<List<GetListInvoiceLinesDto>> getListInvoiceLineByHeadersId(long headerId)
        {
            var listInvoiceLines = from inv in _repositoryInvoiceLines.GetAll().Where(p => p.InvoiceId == headerId)
                              select new GetListInvoiceLinesDto()
                              {
                                  Id = inv.Id,
                                  InvoiceId = inv.InvoiceId,
                                  PoNumber = inv.PoNumber,
                                  Amount= inv.Amount,
                                  ItemDescription= inv.ItemDescription,
                                  ItemId= inv.ItemId,
                                  Quantity=inv.Quantity,
                                  VendorId = inv.VendorId,
                                  Vat = inv.AmountVat,
                                  TaxRate = inv.TaxRate,
                                  UnitPrice = inv.UnitPrice,
                                  LineNum = inv.LineNum
                              };
            return listInvoiceLines.ToList();
        }
    }
}
