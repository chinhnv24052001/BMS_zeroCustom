using DevExpress.XtraPrinting;
using DevExpress.XtraReports.UI;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics.CodeAnalysis;
using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json;
using DevExpress.DataAccess.Json;
using tmss.Web.DxServices.Reports.Payment;
using System.Collections.Generic;
using tmss.PaymentModule.Payment.Dto;
using tmss.PaymentModule.Payment;
using tmss.GR.Dto.ReceiptNote;
using tmss.Web.DxServices.Reports.GR;
using DevExpress.XtraRichEdit;
using DevExpress.XtraRichEdit.API.Native;
using Document = DevExpress.XtraRichEdit.API.Native.Document;
using DevExpress.Office.Utils;
using tmss.Authorization.Users;
using Abp.Dapper.Repositories;
using System;
using System.Reflection;

namespace tmss.Web.Controllers
{
    [Route("api/[controller]")]
    [ApiExplorerSettings(IgnoreApi = true)]
    public class GRReportController : tmssControllerBase
    {

        private readonly IDapperRepository<User, long> _dapper;

        public GRReportController(
            IDapperRepository<User, long> dapper
            )
        {
            _dapper = dapper;
        }


        [HttpPost("[action]")]
        // [AbpAuthorize(AppPermissions.Pages_Crm_Fir_ContactCustomerAfterRepair_ExportClaimReport)]
        public async Task<ActionResult> ExportReceiptNoteReport([FromBody] GetReceiptNoteReportDto input)
        {
            XtraReport report; 
            if (input.FromType == 0)
                report = new ReceiptNoteReport();
            else report = new AcceptanceNoteReport();

            string repJsonP = JsonConvert.SerializeObject(input);
            using (var jsonDataSource = new JsonDataSource
            {
                JsonSource = new CustomJsonSource(repJsonP)
            })
            {
                await jsonDataSource.FillAsync();
                report.DataSource = jsonDataSource;
                report.DataMember = null;

                string contentType = string.Format("application/{0}", "pdf");
                byte[] fileBytes = await ExportFileTypeAsync(report, "pdf", contentType, false);
                report.Dispose();
                report = null;
                if (fileBytes != null)
                    return File(fileBytes, contentType);
                else
                    return BadRequest();
            }
        }

        [HttpPost("[action]")]
        public async Task<ActionResult> ExportPaymentReport([FromBody] GetPaymentReportDto input)
        {

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

            pathToGet = Path.Combine(Directory.GetCurrentDirectory(), folderName);
            path = Path.Combine(pathToGet, filename);

            string stringPathTest2 = $"{pathToGet}/Payment_Template.pdf";
            string stringPathTest1 = $"{pathToGet}/Payment_Template/Payment_Template.rtf";
            RichEditDocumentServer d = new RichEditDocumentServer();
            d.LoadDocumentTemplate(stringPathTest1);

            //Person addperson = new Person();
            PropertyInfo[] props = input.GetType().GetProperties();

            foreach (PropertyInfo prop in props)
            {
                
                string value = Console.ReadLine();
                prop.SetValue(input, value, null);
            }

            //string _sql1 = "select CurrencyCode from MstCurrency where Id = @CurrencyId";
            //var Currency = (await _dapper.QueryAsync<long>(_sql1, new
            //{
            //    CurrencyId = input.CurrencyCode,
            //})).FirstOrDefault();

            //#RequestDate#
            DocumentRange[] RequestDate = d.Document.FindAll("#RequestDate#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in RequestDate)
            {
                d.Document.InsertText(drange.Start, input.RequestDate.ToString("dd/MM/yyyy"));
                d.Document.Delete(drange);
            }

            //#RequestPerson#
            DocumentRange[] RequestPerson = d.Document.FindAll("#RequestPerson#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in RequestPerson)
            {
                d.Document.InsertText(drange.Start, input.EmployeeName);
                d.Document.Delete(drange);
            }

            //Division
            DocumentRange[] Division = d.Document.FindAll("#Division#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in Division)
            {
                d.Document.InsertText(drange.Start, input.EmployeeDept);
                d.Document.Delete(drange);
            }

            //Amount
            DocumentRange[] Amount = d.Document.FindAll("#Amount#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in Amount)
            {
                d.Document.InsertText(drange.Start, FormattedAmount(input.TotalAmount));
                d.Document.Delete(drange);
            }

            //EmpNo
            DocumentRange[] EmpNo = d.Document.FindAll("#EmpNo#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in EmpNo)
            {
                d.Document.InsertText(drange.Start, input.EmployeeCode);
                d.Document.Delete(drange);
            }

            //SUPPLIER BANK ACCOUNT
            //DocumentRange[] SUP_ACC = d.Document.FindAll("#SUP_ACC#", SearchOptions.CaseSensitive, d.Document.Range);
            //foreach (DocumentRange drange in SUP_ACC)
            //{
            //    d.Document.InsertText(drange.Start, purchaseOrderExportDto.SupplierBankAcount);
            //    d.Document.Delete(drange);
            //}

            //DueDate
            DocumentRange[] DueDate = d.Document.FindAll("#DueDate#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in DueDate)
            {
                d.Document.InsertText(drange.Start, input.RequestDuedate.ToString("dd/MM/yyyy"));
                d.Document.Delete(drange);
            }

            //Description
            DocumentRange[] Description = d.Document.FindAll("#Description#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in Description)
            {
                d.Document.InsertText(drange.Start, input.Description);
                d.Document.Delete(drange);
            }

            //Checker
            //DocumentRange[] CHECKER = d.Document.FindAll("#CHECK#", SearchOptions.CaseSensitive, d.Document.Range);
            //foreach (DocumentRange drange in CHECKER)
            //{
            //    d.Document.InsertText(drange.Start, purchaseOrderExportDto.Check);
            //    d.Document.Delete(drange);
            //}
            //PayeeName
            DocumentRange[] CurrencyCode = d.Document.FindAll("#CurrencyCode#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in CurrencyCode)
            {
                d.Document.InsertText(drange.Start, input.CurrencyCode);
                d.Document.Delete(drange);
            }

            //PayeeName
            DocumentRange[] PayeeName = d.Document.FindAll("#PayeeName#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in PayeeName)
            {
                d.Document.InsertText(drange.Start, input.BankAccountName);
                d.Document.Delete(drange);
            }

            //PayeeBankCode
            DocumentRange[] PayeeBankCode = d.Document.FindAll("#PayeeBankCode#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in PayeeBankCode)
            {
                d.Document.InsertText(drange.Start, input.BankAccountNumber);
                d.Document.Delete(drange);
            }

            //PayeeBankName
            DocumentRange[] PayeeBankName = d.Document.FindAll("#PayeeBankName#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in PayeeBankName)
            {
                d.Document.InsertText(drange.Start, input.BankName);
                d.Document.Delete(drange);
            }

            //SupplierName
            DocumentRange[] SupplierName = d.Document.FindAll("#SupplierName#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in SupplierName)
            {
                d.Document.InsertText(drange.Start, input.SupplierName);
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


            DocumentRange[] PaymentLines = d.Document.FindAll("#PaymentLines#", SearchOptions.CaseSensitive, d.Document.Range);
            foreach (DocumentRange drange in PaymentLines)
            {
                if (input.PaymentLines == null)
                {
                    d.Document.Delete(drange);
                }
                else
                {
                    Document document = d.Document;
                    Table table = document.Tables.Create(drange.Start, input.PaymentLines.Count + 1,6, AutoFitBehaviorType.FixedColumnWidth);
                    table.TableAlignment = TableRowAlignment.Center;
                    //table.MergeCells()

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

                    //TableCell cell6 = table[0, 6];
                    //cell6.PreferredWidthType = WidthType.Fixed;
                    //cell6.PreferredWidth = Units.CentimetersToDocumentsF(1);

                    //TableCell cell7 = table[0, 7];
                    //cell7.PreferredWidthType = WidthType.Fixed;
                    //cell7.PreferredWidth = Units.CentimetersToDocumentsF(2);

                    TableCell lastCell = table.Rows[0].LastCell;
                    lastCell.PreferredWidthType = WidthType.Fixed;
                    lastCell.PreferredWidth = Units.CentimetersToDocumentsF(1);

                    #region Set header
                    //d.Document.InsertSingleLineText(table[0, 0].Range.Start, "STT");
                    Paragraph parOrder = d.Document.Paragraphs.Get(table[0, 0].Range.Start);
                    CharacterProperties propsOrder = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 0].Range.Start, "PO number"));
                    propsOrder.Bold = true;
                    propsOrder.FontSize = 10;
                    d.Document.EndUpdateCharacters(propsOrder);
                    parOrder.Alignment = ParagraphAlignment.Center;


                    Paragraph paPartNo = d.Document.Paragraphs.Get(table[0, 1].Range.Start);
                    paPartNo.Alignment = ParagraphAlignment.Center;
                    CharacterProperties propsPartNo = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 1].Range.Start, "Invoice No"));
                    propsPartNo.Bold = true;
                    propsPartNo.FontSize = 10;
                    d.Document.EndUpdateCharacters(propsPartNo);


                    Paragraph parProductName = d.Document.Paragraphs.Get(table[0, 2].Range.Start);
                    parProductName.Alignment = ParagraphAlignment.Center;
                    CharacterProperties propsProductName = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 2].Range.Start, "Invoice Date"));
                    propsProductName.Bold = true;
                    propsProductName.FontSize = 10;
                    d.Document.EndUpdateCharacters(propsProductName);


                    Paragraph parSpecification = d.Document.Paragraphs.Get(table[0, 3].Range.Start);
                    parSpecification.Alignment = ParagraphAlignment.Center;
                    CharacterProperties propsSpecification = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 3].Range.Start, "Actual amount"));
                    propsSpecification.Bold = true;
                    propsSpecification.FontSize = 10;
                    d.Document.EndUpdateCharacters(propsSpecification);


                    Paragraph parUnitPrice = d.Document.Paragraphs.Get(table[0, 4].Range.Start);
                    parUnitPrice.Alignment = ParagraphAlignment.Center;
                    CharacterProperties propsUnitPrice = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 4].Range.Start, "Check amount"));
                    propsUnitPrice.Bold = true;
                    propsUnitPrice.FontSize = 10;
                    d.Document.EndUpdateCharacters(propsUnitPrice);


                    Paragraph parQuanity = d.Document.Paragraphs.Get(table[0, 5].Range.Start);
                    parQuanity.Alignment = ParagraphAlignment.Center;
                    CharacterProperties propsQuanity = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, 5].Range.Start, "Difference"));
                    propsQuanity.Bold = true;
                    propsQuanity.FontSize = 10;
                    d.Document.EndUpdateCharacters(propsQuanity);

                    

                    //Set Table Value
                    int ordering = 1;
                    foreach (var value in input.PaymentLines)
                    {
                        //d.Document.InsertSingleLineText(table[ordering, 0].Range.Start, value.PoNo);
                        //Paragraph PoNo1 = d.Document.Paragraphs.Get(table[ordering, 0].Range.Start);
                        //PoNo1.Alignment = ParagraphAlignment.Center;
                        ////parFirst.FontSize = 10;

                        //if (ordering == 1) table.MergeCells(table.Rows[ordering].Cells[1], table.Rows[ordering].LastCell);


                        d.Document.InsertSingleLineText(table[ordering, 0].Range.Start, value.PoNo);
                        Paragraph PoNo = d.Document.Paragraphs.Get(table[ordering, 0].Range.Start);
                        PoNo.Alignment = ParagraphAlignment.Center;
                        //parFirst.FontSize = 10;

                        d.Document.InsertSingleLineText(table[ordering, 1].Range.Start, value.InvoiceNumber);
                        Paragraph InvoiceNumber = d.Document.Paragraphs.Get(table[ordering, 1].Range.Start);
                        InvoiceNumber.Alignment = ParagraphAlignment.Left;

                        d.Document.InsertSingleLineText(table[ordering, 2].Range.Start, value.InvoiceDate.Value.ToString("dd/MM/yyyy"));
                        Paragraph InvoiceDate = d.Document.Paragraphs.Get(table[ordering, 2].Range.Start);
                        InvoiceDate.Alignment = ParagraphAlignment.Center;

                        d.Document.InsertSingleLineText(table[ordering, 3].Range.Start, FormattedAmount(value.InvoiceAmount));
                        Paragraph paSpecification = d.Document.Paragraphs.Get(table[ordering, 3].Range.Start);
                        paSpecification.Alignment = ParagraphAlignment.Right;

                        d.Document.InsertSingleLineText(table[ordering, 4].Range.Start, FormattedAmount(value.PaymentAmount));
                        Paragraph paUnitPrice = d.Document.Paragraphs.Get(table[ordering, 4].Range.Start);
                        paUnitPrice.Alignment = ParagraphAlignment.Right;

                        d.Document.InsertSingleLineText(table[ordering, 5].Range.Start, FormattedAmount(value.PaymentAmount- value.InvoiceAmount));
                        Paragraph paQuanity = d.Document.Paragraphs.Get(table[ordering, 5].Range.Start);
                        paQuanity.Alignment = ParagraphAlignment.Right;


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

        public string FormattedAmount(decimal? _amount)
        {
                return _amount == null ? "0.00" : string.Format("{0:C}", _amount.Value).Substring(0, string.Format("{0:C}", _amount.Value).Length-1);
        }

        #region -- Loại file xuất
        private async Task<byte[]> ExportFileTypeAsync(XtraReport report, string format, string contentType, [AllowNull] bool editDoc)
        {
            byte[] _byteArray;
            try
            {
                using (MemoryStream ms = new MemoryStream())
                {
                    switch (format)
                    {
                        case "pdf":
                            await report.ExportToPdfAsync(ms);
                            break;
                        case "docx":
                            if (editDoc == true)
                            {
                                // Using DocxExportOptions to export Origional Microsoft Word to allow users can modify after exporting
                                DocxExportOptions DocxExportOptions = new DocxExportOptions()
                                {
                                    ExportMode = DocxExportMode.SingleFile,
                                    ExportPageBreaks = false,
                                    TableLayout = true
                                };
                                await report.ExportToDocxAsync(ms, DocxExportOptions);
                            }
                            else
                            {
                                // Umcomment the snippet code to export Doc file that user cannot modify exported file
                                DocxExportOptions docxExportOptions = new DocxExportOptions()
                                {
                                    ExportMode = DocxExportMode.SingleFilePageByPage
                                };
                                await report.ExportToDocxAsync(ms, docxExportOptions);

                            }
                            break;
                        case "xls":
                            await report.ExportToXlsAsync(ms);
                            break;
                        case "xlsx":
                            await report.ExportToXlsxAsync(ms);
                            break;
                        case "rtf":
                            await report.ExportToRtfAsync(ms);
                            break;
                        case "mht":
                            await report.ExportToMhtAsync(ms);
                            break;
                        case "html":
                            await report.ExportToHtmlAsync(ms);
                            break;
                        case "txt":
                            await report.ExportToTextAsync(ms);
                            break;
                        case "csv":
                            CsvExportOptionsEx csvExportOptionsEx = new CsvExportOptionsEx()
                            {
                                Separator = ",",
                                SkipEmptyColumns = false,
                                SkipEmptyRows = false,
                                //EncodeExecutableContent = DefaultBoolean.True
                            };
                            await report.ExportToCsvAsync(ms, csvExportOptionsEx);
                            break;
                        case "png":
                            await report.ExportToImageAsync(ms, new ImageExportOptions() { Format = System.Drawing.Imaging.ImageFormat.Png });
                            break;
                    }
                    _byteArray = ms.ToArray();
                }
            }
            catch
            {
                _byteArray = null;
            }
            report.Dispose();
            return _byteArray;
        }
        #endregion
    }
}
