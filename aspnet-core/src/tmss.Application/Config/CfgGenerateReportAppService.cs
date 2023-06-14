using Abp.Domain.Repositories;
using Abp.UI;
using DevExpress.Office.Utils;
using DevExpress.XtraRichEdit;
using DevExpress.XtraRichEdit.API.Native;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NPOI.SS.Formula.Functions;
using NPOI.SS.Util;
using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;
using tmss.Config.Dto;
using tmss.EntityFrameworkCore.Repositories;

namespace tmss.Config
{
    public class CfgGenerateReportAppService : tmssAppServiceBase, ICfgGenerateReportAppService
    {
        private readonly IRepository<CfgReportTemplate, long> _cfgRepo;
        private readonly IRepository<CfgReportTemplateTable, long> _cfgTableRepo;
        private readonly IRepository<CfgReportTemplateTableColumn, long> _cfgTableColumnRepo;
        private readonly IRepository<CfgReportTemplateField, long> _cfgReportTemplateField;

        public CfgGenerateReportAppService(IRepository<CfgReportTemplate, long> cfgRepo, IRepository<CfgReportTemplateTable, 
            long> cfgTableRepo, IRepository<CfgReportTemplateTableColumn, long> cfgTableColumnRepo, IRepository<CfgReportTemplateField, long> cfgReportTemplateField)
        {
            _cfgRepo = cfgRepo;
            _cfgTableRepo = cfgTableRepo;
            _cfgTableColumnRepo = cfgTableColumnRepo;
            _cfgReportTemplateField = cfgReportTemplateField;
        }
        public async Task<byte[]> CreateReport(string ReportCode, object FieldDto)
        {

            var tempList = await _cfgRepo.FirstOrDefaultAsync(e => e.ReportCode == ReportCode);
            if (tempList == null) return null;

            string rootPath = "wwwroot";
            string stringPathTest = "wwwroot\\Template.pdf";
            string path = "";

            path = Path.Combine(Directory.GetCurrentDirectory(), rootPath, tempList.ReportTemplate);

            RichEditDocumentServer d = new RichEditDocumentServer();
            d.LoadDocumentTemplate(path);

            //Person addperson = new Person();
            PropertyInfo[] props = FieldDto.GetType().GetProperties();

            //set cho bảng
            var listTable = new List<ReportTableInputDto>();

            var rowData = new List<object>();

            var tableListData = await _cfgTableRepo.GetAll().Where(e => e.ReportTemplateId == tempList.Id).ToListAsync();
            foreach (PropertyInfo prop in props)
            {
                if (tableListData.Any(e => e.PropertyName == prop.Name))
                {
                    var dataList = (FieldDto.GetType().GetProperty(prop.Name).GetValue(FieldDto));

                    //List<object> tableDataFromDto = (List<object>)(IList)dataList ?? new List<object>();
                    List<object> tableDataFromDto = new List<object>((IEnumerable<object>)dataList);

                    listTable.Add(new ReportTableInputDto
                    {
                        HashTag = tableListData.Find(e => e.PropertyName == prop.Name).HashTag,
                        RowData = tableDataFromDto,
                    });
                }
                    

            }


            await generateTable(d, tempList.Id, listTable);


            var fieldTag = await _cfgReportTemplateField.GetAll().Where(e =>e.ReportTemplateId == tempList.Id).ToListAsync();

            // set cho field
            if (fieldTag.Count() > 0)
            {
                foreach (PropertyInfo prop in props)
                {
                    if (fieldTag.Any(e => e.DtoName == prop.Name))
                    {
                        DocumentRange[] propName = d.Document.FindAll("#" + fieldTag.Find(e => e.DtoName == prop.Name).Hashtag + "#", SearchOptions.CaseSensitive, d.Document.Range);
                        if (propName.Length > 0) //Tìm thấy hashtag
                        {
                            foreach (DocumentRange drange in propName)
                            {

                                var fielData = (FieldDto.GetType().GetProperty(prop.Name).GetValue(FieldDto) ?? "").ToString();

                                fielData = FormatAllData(fielData, prop);

                                d.Document.InsertText(drange.Start, fielData);
                                d.Document.Delete(drange);

                            }
                        }
                    }


                }
            }


            //return true;

            d.ExportToPdf(stringPathTest);
            var tempFile = Path.Combine(Directory.GetCurrentDirectory(), stringPathTest);


            byte[] fileByte = await File.ReadAllBytesAsync(tempFile);
            File.Delete(tempFile);

            return fileByte;
            //return File(fileBytes, contentType);

        }

        private async Task generateTable(RichEditDocumentServer d,long tempId, List<ReportTableInputDto> reportTableInputDtos)
        {
            var tables =await _cfgTableRepo.GetAll().Where(e => e.ReportTemplateId == tempId).ToListAsync();
            if (tables == null)  throw new UserFriendlyException(400, "Cannot find Table"); ;
            foreach (var tableData in tables)
            {

                DocumentRange[] PaymentLines = d.Document.FindAll("#"+ tableData.HashTag +"#", SearchOptions.CaseSensitive, d.Document.Range);
                foreach (DocumentRange drange in PaymentLines)
                {
                    if (!reportTableInputDtos.Any(e => e.HashTag == tableData.HashTag))
                    {
                        d.Document.Delete(drange);
                    }
                    else
                    {
                        
                        var column = await _cfgTableColumnRepo.GetAll().Where(e => e.ReportTemplateTableId == tableData.Id).ToListAsync();
                       
                        if (column == null) throw new UserFriendlyException(400, "Cannot find Column"); ;

                        var rowData = reportTableInputDtos.Find(e => e.HashTag == tableData.HashTag).RowData;

                        if (rowData != null && rowData.Count > 0)
                        {
                            Document document = d.Document;
                            Table table = document.Tables.Create(drange.Start, rowData.Count + 1, column.Count, AutoFitBehaviorType.FixedColumnWidth);
                            table.TableAlignment = TableRowAlignment.Center;
                            

                            //create header 
                            for (int i = 0; i < column.Count; i++)
                            {
                                // nhét header 
                                TableCell cell1 = table[0, i];
                                cell1.PreferredWidthType = WidthType.Fixed;
                                cell1.PreferredWidth = Units.CentimetersToDocumentsF(3);
                                cell1.BottomPadding = Units.CentimetersToDocumentsF(0.1f);
                                cell1.TopPadding = Units.CentimetersToDocumentsF(0.1f);
                                //cell.PreferredWidth = Units.CentimetersToDocumentsF(1);

                                //set style cho header 
                                Paragraph parOrder = d.Document.Paragraphs.Get(table[0, i].Range.Start);
                                CharacterProperties propsOrder = d.Document.BeginUpdateCharacters(d.Document.InsertSingleLineText(table[0, i].Range.Start, column.Find(e => e.Seq == i+1).HeaderName));
                                propsOrder.Bold = true;
                                propsOrder.FontSize = 10;
                                d.Document.EndUpdateCharacters(propsOrder);
                                parOrder.Alignment = ParagraphAlignment.Center;

                                
                            }

                            int ordering = 1;
                            foreach (var dataForRow in rowData)// foreach từng dòng trong data
                            {
                                
                                PropertyInfo[] props = dataForRow.GetType().GetProperties();// tìm các thuộc tính của data 

                                for (int i = 0; i < column.Count; i++)
                                {
                                    
                                    var columnData = "";// giá trị mặc định 

                                    foreach (PropertyInfo prop in props)
                                    {
                                        // set dữ liệu cho tưng dòng
                                        if (column.Any(e => e.PropertyName == prop.Name && prop.Name == column.Find(e => e.Seq == i + 1).PropertyName))
                                        {
                                            columnData = (dataForRow.GetType().GetProperty(prop.Name).GetValue(dataForRow) ?? "").ToString();
                                            //format data
                                            columnData = FormatAllData(columnData,prop);

                                                // delete that prop
                                            props = props.Where(val => val != prop).ToArray();

                                            break;
                                        }
                                    }

                                    //set giá trị cho các cell
                                    d.Document.InsertSingleLineText(table[ordering, i].Range.Start, columnData);
                                    Paragraph cellData = d.Document.Paragraphs.Get(table[ordering, i].Range.Start);
                                    cellData.Alignment = ParagraphAlignment.Left;
                                    // style mặc định cho các cell 
                                    TableCell cell = table[ordering,i];
                                    cell.PreferredWidthType = WidthType.Auto;
                                    //cell.PreferredWidth = Units.CentimetersToDocumentsF(6);
                                    cell.BottomPadding = Units.CentimetersToDocumentsF(0.1f);
                                    cell.TopPadding = Units.CentimetersToDocumentsF(0.1f);

                                }
                                ordering++; 
                            }

                            //set style macwj ddinhj cho table
                            table.PreferredWidthType = WidthType.Fixed;
                            table.PreferredWidth = Units.CentimetersToDocumentsF(19);
                        }

                        
                    }
                    d.Document.Delete(drange);
                }
               


            }
        }

        public string FormatAllData(string anyValue,PropertyInfo prop)
        {
            string[] format = new string[] { "dd/MM/yyyy HH:mm:ss" };
            DateTime datetime;
            if (prop.PropertyType == typeof(DateTime?)) anyValue = !string.IsNullOrWhiteSpace(anyValue) ? Convert.ToDateTime(  anyValue).ToString("dd/MM/yyyy") : "";
            if (prop.PropertyType == typeof(decimal?)) anyValue = !string.IsNullOrWhiteSpace(anyValue) ? FormattedAmount(Convert.ToDecimal(anyValue)) : "0.00";

            //if (CheckDate(anyValue)) anyValue = !string.IsNullOrWhiteSpace(anyValue) ? Convert.ToDateTime(anyValue).ToString("dd/MM/yyyy") : "";
            return anyValue;
        }

        private bool CheckDate(string date)
        {
            try
            {
                DateTime dt = DateTime.Parse(date);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public string FormattedAmount(decimal? _amount)
        {
            var value = (_amount == null) ? "0.00" : string.Format("{0:C}", _amount.Value).Substring(0, string.Format("{0:C}", _amount.Value).Length - 1);
            var value1 = value.Split(",")[0].Replace(".", ",");
            var value2 = value.Split(",")[1];
            return value1 + "." + value2;

        }
    }


}
