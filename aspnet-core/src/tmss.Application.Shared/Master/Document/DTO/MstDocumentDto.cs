namespace tmss.Master.Dto
{
    public class MstDocumentDto
    {
        public long Id { get; set; }
        public string DocumentCode { get; set; }
        public string DocumentName { get; set; }
        public string ProcessTypeName { get; set; }
        public long? ProcessTypeId { get; set; }
        public int? IsIrregular { get; set; }
        public string ProductGroupName { get; set; }
        public long? InventoryGroupId { get; set; }
        public int? Leadtime { get; set; }
        public string Status { get; set; }        
    
    }
}
