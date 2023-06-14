using Abp.Application.Services.Dto;
using Abp.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using tmss.PaymentModule.Invoices.Dto;

namespace tmss.PaymentModule.Invoices
{
    public class InvoicesAppService : tmssAppServiceBase
    {
        private readonly IRepository<InvoiceHeaders, long> _invoiceHeadersRepository;
        private readonly IRepository<InvoiceLines, long> _invoiceLinesRepository;
        public InvoicesAppService(
       IRepository<InvoiceHeaders, long> invoiceHeadersRepository,
       IRepository<InvoiceLines, long> invoiceLinesRepository
       )
        {
            _invoiceHeadersRepository = invoiceHeadersRepository;
            _invoiceLinesRepository = invoiceLinesRepository;

        }

        // get all invoice
        public async Task<PagedResultDto<InvoiceHeadersDto>> getAllInvoice()
        {
            var listInvoice = from a in _invoiceHeadersRepository.GetAll().AsNoTracking()
                              select new InvoiceHeadersDto()
                              {
                                  Id = a.Id,
                                  InvoiceNum = a.InvoiceNum,
                                  Description = a.Description,
                                  InvoiceDate = a.InvoiceDate,
                                  VendorId = a.VendorId,
                                  VendorName = a.VendorName,
                                  VendorNumber = a.VendorNumber,
                                  VendorSiteId = a.VendorSiteId,
                                  CurrencyCode = a.CurrencyCode,
                                  Rate = a.Rate,
                                  RateDate = a.RateDate,
                                  InvoiceAmount = a.InvoiceAmount,
                                  AmountVat = a.AmountVat,
                                  TaxId = a.TaxId,
                                  TaxName = a.TaxName,
                                  TaxRate = a.TaxRate,
                                  Differency = a.Differency,
                                  AmountDeducted = a.AmountDeducted,
                                  IsPaid = a.IsPaid
                              };
            var result = listInvoice;
            return new PagedResultDto<InvoiceHeadersDto>(
                       listInvoice.Count(),
                       result.ToList()
                      );
        }
        //get invoiceLines by invoiceId
        public async Task<PagedResultDto<InvoiceLinesDto>> getInvoiceLinesByInvoiceId(long invoiceId)
        {
            var listInvoiceLines = from a in _invoiceLinesRepository.GetAll().AsNoTracking()
                                   where a.InvoiceId == invoiceId
                                   select new InvoiceLinesDto()
                                   {
                                       Id = a.Id,
                                       InvoiceId = a.InvoiceId,
                                       LineNum = a.LineNum,
                                       PoHeaderId = a.PoHeaderId,
                                       PoNumber = a.PoNumber,
                                       VendorId = a.VendorId,
                                       ItemId = a.ItemId,
                                       ItemNumber = a.ItemNumber,
                                       ItemDescription = a.ItemDescription,
                                       CategoryId = a.CategoryId,
                                       Quantity = a.Quantity,
                                       QuantityOrder = a.QuantityOrder,
                                       QuantityOnhand = a.QuantityOnhand,
                                       UnitPrice = a.UnitPrice,
                                       Amount = a.Amount,
                                       AmountVat = a.AmountVat,
                                       ForeignPrice = a.ForeignPrice,
                                       ForeignPriceVnd = a.ForeignPriceVnd,
                                       Flag = a.Flag,
                                       QuantityReceived = a.QuantityReceived,
                                       QuantityMatched = a.QuantityMatched
                                   };
            var result = listInvoiceLines;
            return new PagedResultDto<InvoiceLinesDto>(
                       listInvoiceLines.Count(),
                       result.ToList()
                      );
        }
    }
}
