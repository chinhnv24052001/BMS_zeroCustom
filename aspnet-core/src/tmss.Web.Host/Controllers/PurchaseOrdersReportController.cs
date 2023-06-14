using Abp.Dapper.Repositories;
using Abp.UI;
using DevExpress.Export.Xl;
using DevExpress.Office.Utils;
using DevExpress.XtraRichEdit;
using DevExpress.XtraRichEdit.API.Native;
using Microsoft.AspNetCore.Mvc;
using MimeKit;
using NPOI.HPSF;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using tmss.ImportExcel.Product;
using tmss.ImportExcel.PurchasePurpose;
using tmss.PO.PurchaseOrders;
using tmss.PO.PurchaseOrders.Dto;
using tmss.Authorization.Users;
using tmss.Master.Dto;
using tmss.Price;
using Abp.Domain.Repositories;
using System.Drawing;

namespace tmss.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class PurchaseOrdersReportController : tmssControllerBase
    {

        private readonly IDapperRepository<User, long> _dapper;
        private readonly IRepository<MstAttachFiles, long> _attchFiles;

        public PurchaseOrdersReportController(
            IDapperRepository<User, long> dapper,
            IRepository<MstAttachFiles, long> attchFiles
            )
        {
            _dapper = dapper;
            _attchFiles = attchFiles;
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> printPurchaseOrdersSingle([FromBody] long id)
        {
            try
            {
                PurchaseOrderExportDto purchaseOrderExportDto = new PurchaseOrderExportDto();

                string _sql1 = "EXEC sp_PoGetPOHeaderForExport @PoHeaderId";
                purchaseOrderExportDto = (await _dapper.QueryAsync<PurchaseOrderExportDto>(_sql1, new
                {
                    @PoHeaderId = id,
                })).FirstOrDefault();

                string _sql2 = "EXEC sp_PoGetPoLineForExport @PoHeaderId";
                purchaseOrderExportDto.ListProductForExport = (await _dapper.QueryAsync<GetProductForExportDto>(_sql2, new
                {
                    @PoHeaderId = id,
                })).ToList();

                //var orderFile = _mstSleReportRepository.GetAll().Where(e => e.Id == Input.ReportDefinitionId);
                //if (orderFile == null)
                //{
                //    throw new UserFriendlyException(L("ReportNotFound"));
                //}
                //var filename = orderFile.FirstOrDefault().Path;
                //var fileUrlFullName = orderFile.FirstOrDefault().PathUrl;
                string path = "";
                string pathToGet = "";
                //string FileNameCut = filename.Replace("DocumentTemplate/", "");
                //if (filename == null)
                //{
                //    throw new UserFriendlyException(L("File_Name_Missing_Error"));
                //}
                string filename = "";
                var folderName = "wwwroot";

                pathToGet = Path.Combine(Directory.GetCurrentDirectory(), Path.Combine(folderName, "Template_PO"));
                path = Path.Combine(pathToGet, filename);

                string stringPathTest2 = $"{pathToGet}/Template_PO_single-temp" + id + ".pdf";
                string stringPathTest1 = $"{pathToGet}/Template_PO_Single.rtf";
                RichEditDocumentServer d = new RichEditDocumentServer();
                d.LoadDocumentTemplate(stringPathTest1);

                //Order No
                DocumentRange[] PONUMBER = d.Document.FindAll("#PONUMBER#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in PONUMBER)
                {
                    CharacterProperties cp = d.Document.BeginUpdateCharacters(drange);
                    cp.Bold = true;
                    d.Document.EndUpdateCharacters(cp);

                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.OrderNo);
                    d.Document.Delete(drange);
                }

                //Order Date
                DocumentRange[] NGAYORDER = d.Document.FindAll("#ORDERDATE#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in NGAYORDER)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.OrderDate);
                    d.Document.Delete(drange);
                }

                //Vender
                DocumentRange[] VENDER = d.Document.FindAll("#VENDER#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in VENDER)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Vendor);
                    d.Document.Delete(drange);
                }

                //Tel
                DocumentRange[] TEL = d.Document.FindAll("#TEL#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in TEL)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Tel);
                    d.Document.Delete(drange);
                }

                //FAX
                DocumentRange[] FAX = d.Document.FindAll("#FAX#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in FAX)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Fax);
                    d.Document.Delete(drange);
                }

                //SUPPLIER BANK ACCOUNT
                //DocumentRange[] SUP_ACC = d.Document.FindAll("#SUP_ACC#", SearchOptions.CaseSensitive, d.Document.Range);
                //foreach (DocumentRange drange in SUP_ACC)
                //{
                //    d.Document.InsertText(drange.Start, purchaseOrderExportDto.SupplierBankAcount);
                //    d.Document.Delete(drange);
                //}

                //A/C NO
                DocumentRange[] ACNAME = d.Document.FindAll("#ACNAME#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in ACNAME)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.AcName);
                    d.Document.Delete(drange);
                }

                //A/C NO
                DocumentRange[] ACNO = d.Document.FindAll("#ACNO#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in ACNO)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.AcNo);
                    d.Document.Delete(drange);
                }

                //Checker
                //DocumentRange[] CHECKER = d.Document.FindAll("#CHECK#", SearchOptions.CaseSensitive, d.Document.Range);
                //foreach (DocumentRange drange in CHECKER)
                //{
                //    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Check);
                //    d.Document.Delete(drange);
                //}

                //Attention
                DocumentRange[] ATTENTION = d.Document.FindAll("#ATTENTION#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in ATTENTION)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Attention);
                    d.Document.Delete(drange);
                }

                //DELIVERY DATE
                DocumentRange[] DELIVERY_DATE = d.Document.FindAll("#DELIVERY_DATE#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in DELIVERY_DATE)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.DeliveryDate);
                    d.Document.Delete(drange);
                }

                //PLACE
                DocumentRange[] PLACE = d.Document.FindAll("#PLACE#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in PLACE)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.DeliveryPlace);
                    d.Document.Delete(drange);
                }

                //SHIPMENT
                DocumentRange[] SHIPMENT = d.Document.FindAll("#SHIPMENT#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in SHIPMENT)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Shipment);
                    d.Document.Delete(drange);
                }

                //PRICE BASIS
                DocumentRange[] PRICE_BASIS = d.Document.FindAll("#PRICE_BASIS#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in PRICE_BASIS)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.PriceBasis);
                    d.Document.Delete(drange);
                }

                //Order Amount
                DocumentRange[] ORDER_AMOUNT = d.Document.FindAll("#ORDER_AMOUNT#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in ORDER_AMOUNT)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.OrderAmount);
                    d.Document.Delete(drange);
                }

                //Paid by
                DocumentRange[] PAID_BY = d.Document.FindAll("#PAID_BY#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in PAID_BY)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.PaidBy);
                    d.Document.Delete(drange);
                }

                //Payment term
                DocumentRange[] PAYMENT_TERM = d.Document.FindAll("#PAYMENT_TERM#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in PAYMENT_TERM)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.PaymentTerm);
                    d.Document.Delete(drange);
                }

                //Other
                DocumentRange[] OTHER = d.Document.FindAll("#OTHER#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in OTHER)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Other);
                    d.Document.Delete(drange);
                }

                //Warranty
                DocumentRange[] WARRANTY = d.Document.FindAll("#WARRANTY#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in WARRANTY)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Warranty);
                    d.Document.Delete(drange);
                }

                //Order Contacts
                DocumentRange[] ORDER_CONTACT = d.Document.FindAll("#ORDER_CONTACT#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in ORDER_CONTACT)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.OrderContact);
                    d.Document.Delete(drange);
                }

                //Order Contacts Fax No
                DocumentRange[] FN = d.Document.FindAll("#FN#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in FN)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.CtFaxNo);
                    d.Document.Delete(drange);
                }

                //Order Contacts Tel
                DocumentRange[] OC_TEL = d.Document.FindAll("#OC_TEL#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in OC_TEL)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.CtTel);
                    d.Document.Delete(drange);
                }

                //Order Contacts email
                DocumentRange[] OC_EMAIL = d.Document.FindAll("#OC_EMAIL#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in OC_EMAIL)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.CtEmail);
                    d.Document.Delete(drange);
                }

                //Shipping infor
                DocumentRange[] SHIPP_INFO = d.Document.FindAll("#SHIPP_INFO#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in SHIPP_INFO)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.ShipInfo);
                    d.Document.Delete(drange);
                }

                //Billing to
                DocumentRange[] BILL_TO = d.Document.FindAll("#BILL_TO#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in BILL_TO)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.BillingTo);
                    d.Document.Delete(drange);
                }

                DocumentRange[] USERSIGN = d.Document.FindAll("#USERSIGN#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in USERSIGN)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.UserSign);
                    d.Document.Delete(drange);
                }

                DocumentRange[] DEPARTMENTSIGN = d.Document.FindAll("#DEPARTMENTSIGN#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in DEPARTMENTSIGN)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.DepartmentSign);
                    d.Document.Delete(drange);
                }

                //DocumentRange[] NGAYGIAOXE = d.Document.FindAll("#NGAYGIAOXE#", SearchOptions.CaseSensitive, d.Document.Range);
                //foreach (DocumentRange drange in NGAYGIAOXE)
                //{
                //    d.Document.InsertText(drange.Start, deliveryDate);
                //    d.Document.Delete(drange);
                //}

                //using (HttpClient client = new HttpClient()) // Use dependency injection to get the HttpClient in your application!
                //{
                //    string url = fileUrlFullName; //https://ssa-api.toyotavn.com.vn/DocumentTemplate/BBTT_2022_08_24_23_10.docx
                //    using (Stream streamToReadFrom = await client.GetStreamAsync(url))
                //    {
                //        d.LoadDocument(streamToReadFrom, DocumentFormat.OpenXml);
                //    }
                //}
                //List<GetProductForExportDto> getProductForExportDtos = new List<GetProductForExportDto>();
                //getProductForExportDtos.Add(new GetProductForExportDto()
                //{
                //    LineNum = 1,
                //    PartNo = "62750-26090",
                //    ProductName = "WINDOW ASSY SIDE RR RH",
                //    Specification = "",
                //    UnitPrice = 104.23,
                //    Quanity = 1.2,
                //    Unit = "PIECES",
                //    SubTotal = 104.23

                //});

                //getProductForExportDtos.Add(new GetProductForExportDto()
                //{
                //    LineNum = 1,
                //    PartNo = "62750-26091",
                //    ProductName = "WINDOW ASSY SIDE RR1",
                //    Specification = "",
                //    UnitPrice = 104.24,
                //    Quanity = 1.23,
                //    Unit = "PIECES1",
                //    SubTotal = 104.26

                //});


                DocumentRange[] BANGLINES = d.Document.FindAll("#BANGLINES#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in BANGLINES)
                {
                    if (purchaseOrderExportDto.ListProductForExport == null)
                    {
                        d.Document.Delete(drange);
                    }
                    else
                    {
                        Document document = d.Document;
                        Table table = document.Tables.Create(drange.Start, purchaseOrderExportDto.ListProductForExport.Count() + 1, 9, AutoFitBehaviorType.FixedColumnWidth);
                        table.TableAlignment = TableRowAlignment.Center;

                        TableCell cell = table.Rows[0].FirstCell;
                        cell.PreferredWidthType = WidthType.Fixed;
                        cell.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        TableCell cell1 = table[0, 1];
                        cell1.PreferredWidthType = WidthType.Fixed;
                        cell1.PreferredWidth = Units.CentimetersToDocumentsF(3);

                        TableCell cell2 = table[0, 2];
                        cell2.PreferredWidthType = WidthType.Fixed;
                        cell2.PreferredWidth = Units.CentimetersToDocumentsF(5);

                        TableCell cell3 = table[0, 3];
                        cell3.PreferredWidthType = WidthType.Fixed;
                        cell3.PreferredWidth = Units.CentimetersToDocumentsF(2);

                        TableCell cell4 = table[0, 4];
                        cell4.PreferredWidthType = WidthType.Fixed;
                        cell4.PreferredWidth = Units.CentimetersToDocumentsF(2);

                        TableCell cell5 = table[0, 5];
                        cell5.PreferredWidthType = WidthType.Fixed;
                        cell5.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        TableCell cell6 = table[0, 6];
                        cell6.PreferredWidthType = WidthType.Fixed;
                        cell6.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        TableCell cell7 = table[0, 7];
                        cell7.PreferredWidthType = WidthType.Fixed;
                        cell7.PreferredWidth = Units.CentimetersToDocumentsF(2);

                        TableCell lastCell = table.Rows[0].LastCell;
                        lastCell.PreferredWidthType = WidthType.Fixed;
                        lastCell.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        #region Set header
                        //d.Document.InsertSingleLineText(table[0, 0].Range.Start, "STT");
                        Paragraph parOrder = d.Document.Paragraphs.Get(table[0, 0].Range.Start);
                        CharacterProperties propsOrder = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 0].Range.Start, "No"));
                        propsOrder.Bold = true;
                        propsOrder.FontSize = 10;
                        d.Document.EndUpdateCharacters(propsOrder);
                        parOrder.Alignment = ParagraphAlignment.Center;


                        Paragraph paPartNo = d.Document.Paragraphs.Get(table[0, 1].Range.Start);
                        paPartNo.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsPartNo = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 1].Range.Start, "Part No"));
                        propsPartNo.Bold = true;
                        propsPartNo.FontSize = 10;
                        d.Document.EndUpdateCharacters(propsPartNo);


                        Paragraph parProductName = d.Document.Paragraphs.Get(table[0, 2].Range.Start);
                        parProductName.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsProductName = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 2].Range.Start, "Product Name"));
                        propsProductName.Bold = true;
                        propsProductName.FontSize = 10;
                        d.Document.EndUpdateCharacters(propsProductName);


                        Paragraph parSpecification = d.Document.Paragraphs.Get(table[0, 3].Range.Start);
                        parSpecification.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsSpecification = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 3].Range.Start, "Specification"));
                        propsSpecification.Bold = true;
                        propsSpecification.FontSize = 10;
                        d.Document.EndUpdateCharacters(propsSpecification);


                        Paragraph parUnitPrice = d.Document.Paragraphs.Get(table[0, 4].Range.Start);
                        parUnitPrice.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsUnitPrice = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 4].Range.Start, "Unit Price"));
                        propsUnitPrice.Bold = true;
                        propsUnitPrice.FontSize = 10;
                        d.Document.EndUpdateCharacters(propsUnitPrice);


                        Paragraph parQuanity = d.Document.Paragraphs.Get(table[0, 5].Range.Start);
                        parQuanity.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsQuanity = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 5].Range.Start, "Q’ty"));
                        propsQuanity.Bold = true;
                        propsQuanity.FontSize = 10;
                        d.Document.EndUpdateCharacters(propsQuanity);


                        Paragraph paUnit = d.Document.Paragraphs.Get(table[0, 6].Range.Start);
                        paUnit.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsUnit = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 6].Range.Start, "Unit"));
                        propsUnit.Bold = true;
                        propsUnit.FontSize = 10;
                        d.Document.EndUpdateCharacters(propsUnit);

                        Paragraph paSubtotal = d.Document.Paragraphs.Get(table[0, 7].Range.Start);
                        paSubtotal.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsSubtotal = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 7].Range.Start, "Subtotal"));
                        propsSubtotal.Bold = true;
                        propsSubtotal.FontSize = 10;
                        d.Document.EndUpdateCharacters(propsSubtotal);

                        Paragraph paWarranty = d.Document.Paragraphs.Get(table[0, 8].Range.Start);
                        paWarranty.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propspaWarranty = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 8].Range.Start, "Warranty"));
                        propspaWarranty.Bold = true;
                        propspaWarranty.FontSize = 10;
                        d.Document.EndUpdateCharacters(propspaWarranty);

                        //Set Table Value
                        int ordering = 1;
                        foreach (GetProductForExportDto getProductForExportDto in purchaseOrderExportDto.ListProductForExport)
                        {
                            d.Document.InsertSingleLineText(table[ordering, 0].Range.Start, ordering.ToString());
                            Paragraph parFirst = d.Document.Paragraphs.Get(table[ordering, 0].Range.Start);
                            parFirst.Alignment = ParagraphAlignment.Center;
                            //parFirst.FontSize = 10;

                            d.Document.InsertSingleLineText(table[ordering, 1].Range.Start, getProductForExportDto.PartNo);
                            Paragraph parPartNo = d.Document.Paragraphs.Get(table[ordering, 1].Range.Start);
                            parPartNo.Alignment = ParagraphAlignment.Left;

                            d.Document.InsertSingleLineText(table[ordering, 2].Range.Start, (getProductForExportDto.ProductName != null && getProductForExportDto.ProductName.Split("||").Count() > 0) ? getProductForExportDto.ProductName.Split("||")[0] : "");
                            Paragraph parPartName = d.Document.Paragraphs.Get(table[ordering, 2].Range.Start);
                            parPartName.Alignment = ParagraphAlignment.Left;

                            d.Document.InsertSingleLineText(table[ordering, 3].Range.Start, (getProductForExportDto.ProductName != null && getProductForExportDto.ProductName.Split("||").Count() > 1) ? getProductForExportDto.ProductName.Split("||")[1] : ""); ;
                            Paragraph paSpecification = d.Document.Paragraphs.Get(table[ordering, 3].Range.Start);
                            paSpecification.Alignment = ParagraphAlignment.Left;

                            d.Document.InsertSingleLineText(table[ordering, 4].Range.Start, getProductForExportDto.UnitPrice.ToString());
                            Paragraph paUnitPrice = d.Document.Paragraphs.Get(table[ordering, 4].Range.Start);
                            paUnitPrice.Alignment = ParagraphAlignment.Right;

                            d.Document.InsertSingleLineText(table[ordering, 5].Range.Start, getProductForExportDto.Quanity.ToString());
                            Paragraph paQuanity = d.Document.Paragraphs.Get(table[ordering, 5].Range.Start);
                            paQuanity.Alignment = ParagraphAlignment.Right;

                            d.Document.InsertSingleLineText(table[ordering, 6].Range.Start, getProductForExportDto.Unit);
                            Paragraph parUnit = d.Document.Paragraphs.Get(table[ordering, 6].Range.Start);
                            parUnit.Alignment = ParagraphAlignment.Center;

                            d.Document.InsertSingleLineText(table[ordering, 7].Range.Start, getProductForExportDto.SubTotal.ToString());
                            Paragraph paSubTotal = d.Document.Paragraphs.Get(table[ordering, 7].Range.Start);
                            paSubTotal.Alignment = ParagraphAlignment.Right;

                            d.Document.InsertSingleLineText(table[ordering, 8].Range.Start, getProductForExportDto.Warranty);
                            Paragraph parWarranty = d.Document.Paragraphs.Get(table[ordering, 8].Range.Start);
                            parWarranty.Alignment = ParagraphAlignment.Left;

                            ordering++;
                        }
                        d.Document.Delete(drange);

                        #endregion
                    }
                }

                //d.SaveDocument(stringPathTest2, DevExpress.XtraRichEdit.DocumentFormat.OpenXml);
                d.ExportToPdf(stringPathTest2);
                string contentType = string.Format("application/{0}", "pdf");

                var memory = new MemoryStream();
                using (var stream = new FileStream(stringPathTest2, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                byte[] fileBytes = memory.ToArray();
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(400, L("PrintFileError"));
            }
        }


        //Delivery
        [HttpPost("[action]")]
        public async Task<IActionResult> printPurchaseOrdersMulti([FromBody] long id)
        {
            try
            {

                string path = "";
                string pathToGet = "";
                string filename = "";
                var folderName = "wwwroot";
                int countColumn = 0;

                PurchaseOrderExportDto purchaseOrderExportDto = new PurchaseOrderExportDto();

                string _sql1 = "EXEC sp_PoGetPOHeaderForExport @p_Id";
                purchaseOrderExportDto = (await _dapper.QueryAsync<PurchaseOrderExportDto>(_sql1, new
                {
                    @p_Id = id,
                })).FirstOrDefault();

                string _sql2 = "EXEC sp_PoGetPoLineForExportMulti @p_Id";
                purchaseOrderExportDto.ListProductForExport = (await _dapper.QueryAsync<GetProductForExportDto>(_sql2, new
                {
                    @p_Id = id,
                })).ToList();

                if (purchaseOrderExportDto.ListProductForExport != null && purchaseOrderExportDto.ListProductForExport.Count() > 0)
                    foreach (GetProductForExportDto getProductForExport in purchaseOrderExportDto.ListProductForExport)
                    {
                        int tempCountColumn = 0;
                        if (getProductForExport.Mar02 != null && getProductForExport.Mar02 > 0)
                        {
                            tempCountColumn++;
                        }

                        if (getProductForExport.Mar07 != null && getProductForExport.Mar07 > 0)
                        {
                            tempCountColumn++;
                        }

                        if (getProductForExport.Mar13 != null && getProductForExport.Mar13 > 0)
                        {
                            tempCountColumn++;
                        }

                        if (getProductForExport.Mar17 != null && getProductForExport.Mar17 > 0)
                        {
                            tempCountColumn++;
                        }

                        if (tempCountColumn >= countColumn)
                        {
                            countColumn = tempCountColumn;
                        }
                    }

                pathToGet = Path.Combine(Directory.GetCurrentDirectory(), Path.Combine(folderName, "Template_PO"));
                path = Path.Combine(pathToGet, filename);

                string stringPathTest2 = $"{pathToGet}/Template_PO_Multi-temp.trf";
                string stringPathTest1 = $"{pathToGet}/Template_PO_Multi.rtf";
                RichEditDocumentServer d = new RichEditDocumentServer();
                d.LoadDocumentTemplate(stringPathTest1);

                DocumentRange[] PONUMBER = d.Document.FindAll("#PONUMBER#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in PONUMBER)
                {
                    //Paragraph parOrder = d.Document.Paragraphs.Get(drange.Start);
                    CharacterProperties propsPoNumber = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(drange.Start, purchaseOrderExportDto.OrderNo));
                    propsPoNumber.Bold = true;
                    d.Document.EndUpdateCharacters(propsPoNumber);

                    //d.Document.InsertText(drange.Start, purchaseOrderExportDto.OrderNo);
                    d.Document.Delete(drange);
                }

                //Order Date
                DocumentRange[] NGAYORDER = d.Document.FindAll("#ORDERDATE#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in NGAYORDER)
                {

                    //Paragraph parOrder = d.Document.Paragraphs.Get(drange.Start);
                    CharacterProperties ngayOrder = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(drange.Start, purchaseOrderExportDto.OrderDate));
                    ngayOrder.Bold = true;
                    d.Document.EndUpdateCharacters(ngayOrder);

                    //d.Document.InsertText(drange.Start, purchaseOrderExportDto.OrderDate);
                    d.Document.Delete(drange);
                }

                //Vender
                DocumentRange[] VENDER = d.Document.FindAll("#VENDER#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in VENDER)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Vendor);
                    d.Document.Delete(drange);
                }

                //Vender
                DocumentRange[] BANKNAME = d.Document.FindAll("#BANKNAME#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in BANKNAME)
                {
                    d.Document.InsertText(drange.Start, "");
                    d.Document.Delete(drange);
                }


                //Tel
                DocumentRange[] TEL = d.Document.FindAll("#TEL#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in TEL)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Tel);
                    d.Document.Delete(drange);
                }

                //FAX
                DocumentRange[] FAX = d.Document.FindAll("#FAX#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in FAX)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Fax);
                    d.Document.Delete(drange);
                }

                //SUPPLIER BANK ACCOUNT
                //DocumentRange[] SUP_ACC = d.Document.FindAll("#SUP_ACC#", SearchOptions.CaseSensitive, d.Document.Range);
                //foreach (DocumentRange drange in SUP_ACC)
                //{
                //    d.Document.InsertText(drange.Start, purchaseOrderExportDto.SupplierBankAcount);
                //    d.Document.Delete(drange);
                //}

                //A/C NO
                DocumentRange[] ACNAME = d.Document.FindAll("#ACNAME#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in ACNAME)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.AcName);
                    d.Document.Delete(drange);
                }

                //A/C NO
                DocumentRange[] ACNO = d.Document.FindAll("#ACNO#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in ACNO)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.AcNo);
                    d.Document.Delete(drange);
                }

                //Checker
                //DocumentRange[] CHECKER = d.Document.FindAll("#CHECK#", SearchOptions.CaseSensitive, d.Document.Range);
                //foreach (DocumentRange drange in CHECKER)
                //{
                //    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Check);
                //    d.Document.Delete(drange);
                //}

                //Attention
                DocumentRange[] ATTENTION = d.Document.FindAll("#ATTENTION#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in ATTENTION)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Attention);
                    d.Document.Delete(drange);
                }

                //DELIVERY DATE
                DocumentRange[] DELIVERY_DATE = d.Document.FindAll("#DELIVERY_DATE#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in DELIVERY_DATE)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.DeliveryDate);
                    d.Document.Delete(drange);
                }

                //PLACE
                DocumentRange[] PLACE = d.Document.FindAll("#PLACE#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in PLACE)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.DeliveryPlace);
                    d.Document.Delete(drange);
                }

                //SHIPMENT
                DocumentRange[] SHIPMENT = d.Document.FindAll("#SHIPMENT#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in SHIPMENT)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Shipment);
                    d.Document.Delete(drange);
                }

                //PRICE BASIS
                DocumentRange[] PRICE_BASIS = d.Document.FindAll("#PRICE_BASIS#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in PRICE_BASIS)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.PriceBasis);
                    d.Document.Delete(drange);
                }

                //Order Amount
                DocumentRange[] ORDER_AMOUNT = d.Document.FindAll("#ORDER_AMOUNT#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in ORDER_AMOUNT)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.OrderAmount);
                    d.Document.Delete(drange);
                }

                //Paid by
                DocumentRange[] PAID_BY = d.Document.FindAll("#PAID_BY#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in PAID_BY)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.PaidBy);
                    d.Document.Delete(drange);
                }

                //Payment term
                DocumentRange[] PAYMENT_TERM = d.Document.FindAll("#PAYMENT_TERM#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in PAYMENT_TERM)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.PaymentTerm);
                    d.Document.Delete(drange);
                }

                //Other
                DocumentRange[] OTHER = d.Document.FindAll("#OTHER#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in OTHER)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Other);
                    d.Document.Delete(drange);
                }

                //Warranty
                DocumentRange[] WARRANTY = d.Document.FindAll("#WARRANTY#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in WARRANTY)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Warranty);
                    d.Document.Delete(drange);
                }

                //Order Contacts
                DocumentRange[] ORDER_CONTACT = d.Document.FindAll("#ORDER_CONTACT#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in ORDER_CONTACT)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.OrderContact);
                    d.Document.Delete(drange);
                }

                //Order Contacts Fax No
                DocumentRange[] FN = d.Document.FindAll("#FN#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in FN)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.CtFaxNo);
                    d.Document.Delete(drange);
                }

                //Order Contacts Tel
                DocumentRange[] OC_TEL = d.Document.FindAll("#OC_TEL#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in OC_TEL)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.CtTel);
                    d.Document.Delete(drange);
                }

                //Order Contacts email
                DocumentRange[] OC_EMAIL = d.Document.FindAll("#OC_EMAIL#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in OC_EMAIL)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.CtEmail);
                    d.Document.Delete(drange);
                }

                //Shipping infor
                DocumentRange[] SHIPP_INFO = d.Document.FindAll("#SHIPP_INFO#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in SHIPP_INFO)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.ShipInfo);
                    d.Document.Delete(drange);
                }

                //Billing to
                DocumentRange[] BILL_TO = d.Document.FindAll("#BILL_TO#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in BILL_TO)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.BillingTo);
                    d.Document.Delete(drange);
                }

                DocumentRange[] USERSIGN = d.Document.FindAll("#USERSIGN#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in USERSIGN)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.UserSign);
                    d.Document.Delete(drange);
                }

                DocumentRange[] DEPARTMENTSIGN = d.Document.FindAll("#DEPARTMENTSIGN#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in DEPARTMENTSIGN)
                {
                    d.Document.InsertText(drange.Start, purchaseOrderExportDto.DepartmentSign);
                    d.Document.Delete(drange);
                }

                int colNumber = 6;
                DocumentRange[] BANGLINES = d.Document.FindAll("#BANGLINES#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in BANGLINES)
                {
                    if (purchaseOrderExportDto.ListProductForExport == null)
                    {
                        d.Document.Delete(drange);
                    }
                    else
                    {
                        Document document = d.Document;
                        Table table = document.Tables.Create(drange.Start, purchaseOrderExportDto.ListProductForExport.Count() + 2, colNumber + countColumn + 4, AutoFitBehaviorType.FixedColumnWidth);
                        table.TableAlignment = TableRowAlignment.Center;

                        TableCell cell = table.Rows[0].FirstCell;
                        cell.PreferredWidthType = WidthType.Fixed;
                        cell.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        TableCell cell1 = table[0, 1];
                        cell1.PreferredWidthType = WidthType.Fixed;
                        cell1.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        TableCell cell2 = table[0, 2];
                        cell2.PreferredWidthType = WidthType.Fixed;
                        cell2.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        TableCell cell3 = table[0, 3];
                        cell3.PreferredWidthType = WidthType.Fixed;
                        cell3.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        TableCell cell4 = table[0, 4];
                        cell4.PreferredWidthType = WidthType.Fixed;
                        cell4.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        TableCell cell5 = table[0, 5];
                        cell5.PreferredWidthType = WidthType.Fixed;
                        cell5.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        TableCell cell6 = table[0, 6];
                        cell6.PreferredWidthType = WidthType.Fixed;
                        cell6.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        if (countColumn == 1)
                        {
                            colNumber++;
                            TableCell cell7 = table[0, colNumber];
                            cell7.PreferredWidthType = WidthType.Fixed;
                            cell7.PreferredWidth = Units.CentimetersToDocumentsF(1);
                        }

                        if (countColumn == 2)
                        {
                            colNumber++;
                            TableCell cell8 = table[0, colNumber];
                            cell8.PreferredWidthType = WidthType.Fixed;
                            cell8.PreferredWidth = Units.CentimetersToDocumentsF(1);
                        }

                        if (countColumn == 3)
                        {
                            colNumber++;
                            TableCell cell9 = table[0, colNumber];
                            cell9.PreferredWidthType = WidthType.Fixed;
                            cell9.PreferredWidth = Units.CentimetersToDocumentsF(1);
                        }

                        if (countColumn == 4)
                        {
                            colNumber++;
                            TableCell cell10 = table[0, colNumber];
                            cell10.PreferredWidthType = WidthType.Fixed;
                            cell10.PreferredWidth = Units.CentimetersToDocumentsF(1);
                        }

                        TableCell cell11 = table[0, colNumber + 1];
                        cell11.PreferredWidthType = WidthType.Fixed;
                        cell11.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        TableCell cell12 = table[0, colNumber + 2];
                        cell12.PreferredWidthType = WidthType.Fixed;
                        cell12.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        TableCell lastCell = table.Rows[0].LastCell;
                        lastCell.PreferredWidthType = WidthType.Fixed;
                        lastCell.PreferredWidth = Units.CentimetersToDocumentsF(1);

                        #region Set header
                        colNumber = 6;
                        //d.Document.InsertSingleLineText(table[0, 0].Range.Start, "STT");

                        Paragraph parOrder = d.Document.Paragraphs.Get(table[0, 0].Range.Start);
                        CharacterProperties propsOrder = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 0].Range.Start, "No"));
                        propsOrder.Bold = true;
                        propsOrder.FontSize = 8;
                        d.Document.EndUpdateCharacters(propsOrder);
                        parOrder.Alignment = ParagraphAlignment.Center;


                        Paragraph paPartNo = d.Document.Paragraphs.Get(table[0, 1].Range.Start);
                        paPartNo.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsPartNo = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 1].Range.Start, "Part No"));
                        propsPartNo.Bold = true;
                        propsPartNo.FontSize = 8;
                        d.Document.EndUpdateCharacters(propsPartNo);


                        Paragraph parProductName = d.Document.Paragraphs.Get(table[0, 2].Range.Start);
                        parProductName.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsProductName = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 2].Range.Start, "Product Name"));
                        propsProductName.Bold = true;
                        propsProductName.FontSize = 8;
                        d.Document.EndUpdateCharacters(propsProductName);


                        Paragraph parSpecification = d.Document.Paragraphs.Get(table[0, 3].Range.Start);
                        parSpecification.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsSpecification = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 3].Range.Start, "Specification"));
                        propsSpecification.Bold = true;
                        propsSpecification.FontSize = 8;
                        d.Document.EndUpdateCharacters(propsSpecification);


                        Paragraph parUnitPrice = d.Document.Paragraphs.Get(table[0, 4].Range.Start);
                        parUnitPrice.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsUnitPrice = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 4].Range.Start, "Unit Price"));
                        propsUnitPrice.Bold = true;
                        propsUnitPrice.FontSize = 8;
                        d.Document.EndUpdateCharacters(propsUnitPrice);

                        Paragraph paUnit = d.Document.Paragraphs.Get(table[0, 5].Range.Start);
                        paUnit.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsUnit = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 5].Range.Start, "Unit"));
                        propsUnit.Bold = true;
                        propsUnit.FontSize = 8;
                        d.Document.EndUpdateCharacters(propsUnit);

                        Paragraph parQuanity = d.Document.Paragraphs.Get(table[0, 6].Range.Start);
                        parQuanity.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsQuanity = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 6].Range.Start, "Q’ty"));
                        propsQuanity.Bold = true;
                        propsQuanity.FontSize = 8;
                        d.Document.EndUpdateCharacters(propsQuanity);

                        if (countColumn == 1)
                        {
                            colNumber++;
                            Paragraph mar02 = d.Document.Paragraphs.Get(table[0, colNumber].Range.Start);
                            mar02.Alignment = ParagraphAlignment.Center;
                            CharacterProperties propsMar02 = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, colNumber].Range.Start, "02-MAR"));
                            propsMar02.Bold = true;
                            propsMar02.FontSize = 8;
                            d.Document.EndUpdateCharacters(propsMar02);
                        }

                        if (countColumn == 2)
                        {
                            colNumber++;
                            Paragraph mar07 = d.Document.Paragraphs.Get(table[0, colNumber].Range.Start);
                            mar07.Alignment = ParagraphAlignment.Center;
                            CharacterProperties propsMar07 = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, colNumber].Range.Start, "07-MAR"));
                            propsMar07.Bold = true;
                            propsMar07.FontSize = 8;
                            d.Document.EndUpdateCharacters(propsMar07);
                        }

                        if (countColumn == 3)
                        {
                            colNumber++;
                            Paragraph mar13 = d.Document.Paragraphs.Get(table[0, colNumber].Range.Start);
                            mar13.Alignment = ParagraphAlignment.Center;
                            CharacterProperties propsMar13 = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, colNumber].Range.Start, "13-MAR"));
                            propsMar13.Bold = true;
                            propsMar13.FontSize = 8;
                            d.Document.EndUpdateCharacters(propsMar13);
                        }

                        if (countColumn == 4)
                        {
                            colNumber++;
                            Paragraph mar17 = d.Document.Paragraphs.Get(table[0, colNumber].Range.Start);
                            mar17.Alignment = ParagraphAlignment.Center;
                            CharacterProperties propsMar17 = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, colNumber].Range.Start, "17-MAR"));
                            propsMar17.Bold = true;
                            propsMar17.FontSize = 8;
                            d.Document.EndUpdateCharacters(propsMar17);
                        }

                        Paragraph Forecast = d.Document.Paragraphs.Get(table[0, colNumber + 1].Range.Start);
                        Forecast.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsForecast = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, colNumber + 1].Range.Start, "Forecast"));
                        propsForecast.Bold = true;
                        propsForecast.FontSize = 8;
                        d.Document.EndUpdateCharacters(propsForecast);

                        Paragraph paWarranty = d.Document.Paragraphs.Get(table[0, colNumber + 3].Range.Start);
                        paWarranty.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propspaWarranty = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, colNumber + 3].Range.Start, "Warranty"));
                        propspaWarranty.Bold = true;
                        propspaWarranty.FontSize = 8;
                        d.Document.EndUpdateCharacters(propspaWarranty);

                        Paragraph fore1 = d.Document.Paragraphs.Get(table[1, colNumber + 2].Range.Start);
                        fore1.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsFore1 = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[1, colNumber + 1].Range.Start, "N+1"));
                        propsFore1.Bold = true;
                        propsFore1.FontSize = 8;
                        d.Document.EndUpdateCharacters(propsFore1);

                        Paragraph fore2 = d.Document.Paragraphs.Get(table[1, colNumber + 2].Range.Start);
                        fore2.Alignment = ParagraphAlignment.Center;
                        CharacterProperties propsFore2 = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[1, colNumber + 2].Range.Start, "N+2"));
                        propsFore2.Bold = true;
                        propsFore2.FontSize = 8;
                        d.Document.EndUpdateCharacters(propsFore2);

                        colNumber = 6;
                        table.MergeCells(table[0, 0], table[1, 0]);
                        table.MergeCells(table[0, 1], table[1, 1]);
                        table.MergeCells(table[0, 2], table[1, 2]);
                        table.MergeCells(table[0, 3], table[1, 3]);
                        table.MergeCells(table[0, 4], table[1, 4]);
                        table.MergeCells(table[0, 5], table[1, 5]);
                        table.MergeCells(table[0, 6], table[1, 6]);

                        if (countColumn == 1)
                        {
                            colNumber++;
                            table.MergeCells(table[0, colNumber], table[1, colNumber]);
                        }

                        if (countColumn == 2)
                        {
                            colNumber++;
                            table.MergeCells(table[0, colNumber], table[1, colNumber]);
                        }

                        if (countColumn == 3)
                        {
                            colNumber++;
                            table.MergeCells(table[0, colNumber], table[1, colNumber]);
                        }

                        if (countColumn == 4)
                        {
                            colNumber++;
                            table.MergeCells(table[0, colNumber], table[1, colNumber]);
                        }
                        table.MergeCells(table[0, colNumber + 1], table[0, colNumber + 2]);
                        table.MergeCells(table.Rows[0].LastCell, table.Rows[1].LastCell);
                        //Set Table Value


                        int ordering = 2;
                        foreach (GetProductForExportDto getProductForExportDto in purchaseOrderExportDto.ListProductForExport)
                        {
                            colNumber = 6;

                            d.Document.InsertSingleLineText(table[ordering, 0].Range.Start, (ordering - 1).ToString());
                            Paragraph parFirst = d.Document.Paragraphs.Get(table[ordering, 0].Range.Start);
                            parFirst.Alignment = ParagraphAlignment.Center;
                            //parFirst.FontSize = 10;

                            d.Document.InsertSingleLineText(table[ordering, 1].Range.Start, getProductForExportDto.PartNo);
                            Paragraph parPartNo = d.Document.Paragraphs.Get(table[ordering, 1].Range.Start);
                            parPartNo.Alignment = ParagraphAlignment.Left;

                            d.Document.InsertSingleLineText(table[ordering, 2].Range.Start, (getProductForExportDto.ProductName != null && getProductForExportDto.ProductName.Split("||").Count() > 0) ? getProductForExportDto.ProductName.Split("||")[0] : "");
                            Paragraph parPartName = d.Document.Paragraphs.Get(table[ordering, 2].Range.Start);
                            parPartName.Alignment = ParagraphAlignment.Left;

                            d.Document.InsertSingleLineText(table[ordering, 3].Range.Start, (getProductForExportDto.ProductName != null && getProductForExportDto.ProductName.Split("||").Count() > 1) ? getProductForExportDto.ProductName.Split("||")[1] : "");
                            Paragraph paSpecification = d.Document.Paragraphs.Get(table[ordering, 3].Range.Start);
                            paSpecification.Alignment = ParagraphAlignment.Left;

                            d.Document.InsertSingleLineText(table[ordering, 4].Range.Start, getProductForExportDto.UnitPrice);
                            Paragraph paUnitPrice = d.Document.Paragraphs.Get(table[ordering, 4].Range.Start);
                            paUnitPrice.Alignment = ParagraphAlignment.Right;

                            d.Document.InsertSingleLineText(table[ordering, 5].Range.Start, getProductForExportDto.Unit);
                            Paragraph parUnit = d.Document.Paragraphs.Get(table[ordering, 5].Range.Start);
                            parUnit.Alignment = ParagraphAlignment.Center;

                            d.Document.InsertSingleLineText(table[ordering, 6].Range.Start, getProductForExportDto.Quanity.ToString());
                            Paragraph paQuanity = d.Document.Paragraphs.Get(table[ordering, 6].Range.Start);
                            paQuanity.Alignment = ParagraphAlignment.Right;


                            if (countColumn == 1)
                            {
                                colNumber++;
                                d.Document.InsertSingleLineText(table[ordering, colNumber].Range.Start, getProductForExportDto.Mar02.ToString());
                                Paragraph paMar02 = d.Document.Paragraphs.Get(table[ordering, colNumber].Range.Start);
                                paMar02.Alignment = ParagraphAlignment.Right;
                            }

                            if (countColumn == 2)
                            {
                                colNumber++;
                                d.Document.InsertSingleLineText(table[ordering, colNumber].Range.Start, getProductForExportDto.Mar07.ToString());
                                Paragraph paMar07 = d.Document.Paragraphs.Get(table[ordering, colNumber].Range.Start);
                                paMar07.Alignment = ParagraphAlignment.Right;
                            }

                            if (countColumn == 3)
                            {
                                colNumber++;
                                d.Document.InsertSingleLineText(table[ordering, colNumber].Range.Start, getProductForExportDto.Mar13.ToString());
                                Paragraph paMar13 = d.Document.Paragraphs.Get(table[ordering, colNumber].Range.Start);
                                paMar13.Alignment = ParagraphAlignment.Right;

                            }

                            if (countColumn == 4)
                            {
                                colNumber++;
                                d.Document.InsertSingleLineText(table[ordering, colNumber].Range.Start, getProductForExportDto.Mar17.ToString());
                                Paragraph paMar17 = d.Document.Paragraphs.Get(table[ordering, colNumber].Range.Start);
                                paMar17.Alignment = ParagraphAlignment.Right;
                            }

                            d.Document.InsertSingleLineText(table[ordering, colNumber + 1].Range.Start, getProductForExportDto.Forcast1.ToString());
                            Paragraph forcast1 = d.Document.Paragraphs.Get(table[ordering, colNumber + 1].Range.Start);
                            forcast1.Alignment = ParagraphAlignment.Right;

                            d.Document.InsertSingleLineText(table[ordering, colNumber + 2].Range.Start, getProductForExportDto.Forcast2.ToString());
                            Paragraph forcast2 = d.Document.Paragraphs.Get(table[ordering, colNumber + 2].Range.Start);
                            forcast2.Alignment = ParagraphAlignment.Right;

                            d.Document.InsertSingleLineText(table[ordering, colNumber + 3].Range.Start, getProductForExportDto.Warranty);
                            Paragraph parWarranty = d.Document.Paragraphs.Get(table[ordering, colNumber + 3].Range.Start);
                            parWarranty.Alignment = ParagraphAlignment.Left;

                            ordering++;
                        }
                        d.Document.Delete(drange);

                        #endregion
                    }
                }

                d.ExportToPdf(stringPathTest2);
                string contentType = string.Format("application/{0}", "pdf");

                var memory = new MemoryStream();
                using (var stream = new FileStream(stringPathTest2, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                byte[] fileBytes = memory.ToArray();
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(400, L("PrintFileError"));
            }
        }

        [HttpPost("[action]")]
        public async Task<IActionResult> printPurchaseOrdersContract([FromBody] InputPrintPoContractDto inputPrintPoContractDto)
        {
            try
            {
                MstAttachFiles mstAttachFiles = _attchFiles.FirstOrDefault(p => p.HeaderId == inputPrintPoContractDto.TemplateContractId && p.AttachFileType.Equals("TC"));

                if (mstAttachFiles == null)
                {
                    throw new UserFriendlyException(L("FileAttachIsEmpty"));
                }

                GetPoForPrintPoContractDto forPrintPoContractDto = new GetPoForPrintPoContractDto();

                string _sql1 = "EXEC sp_PoPrintPoContract @PoHeaderId";
                forPrintPoContractDto = (await _dapper.QueryAsync<GetPoForPrintPoContractDto>(_sql1, new
                {
                    @PoHeaderId = inputPrintPoContractDto.PurchaseOrdersId,
                })).FirstOrDefault();

                var folderName = Path.Combine("wwwroot");
                var pathToGet = Path.Combine(Directory.GetCurrentDirectory(), folderName);
                string path = Path.Combine(pathToGet, mstAttachFiles.RootPath);
                string pathFileTemp = Path.Combine(pathToGet, "FoldersFileTemp/PoContractTemp.pdf");


                RichEditDocumentServer d = new RichEditDocumentServer();
                d.LoadDocumentTemplate(path);

                //Order No
                DocumentRange[] TENKHACHHANG = d.Document.FindAll("#PONUMBER#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in TENKHACHHANG)
                {
                    d.Document.InsertText(drange.Start, "");
                    d.Document.Delete(drange);
                }

                //d.SaveDocument(stringPathTest2, DevExpress.XtraRichEdit.DocumentFormat.OpenXml);
                d.ExportToPdf(pathFileTemp);
                string contentType = string.Format("application/{0}", "pdf");

                var memory = new MemoryStream();
                using (var stream = new FileStream(pathFileTemp, FileMode.Open))
                {
                    await stream.CopyToAsync(memory);
                }
                byte[] fileBytes = memory.ToArray();
                return File(fileBytes, contentType);
            }
            catch (Exception ex)
            {
                throw new UserFriendlyException(400, L("PrintFileError"));
            }

        }
    }
}