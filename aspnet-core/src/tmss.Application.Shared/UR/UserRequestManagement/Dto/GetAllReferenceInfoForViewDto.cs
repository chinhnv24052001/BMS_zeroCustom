namespace tmss.UR.UserRequestManagement.Dto
{
    public class GetAllReferenceInfoForViewDto
    {
        public string Type { get; set; }
        public string ReferenceNum { get; set; }
        public int? ReferenceLineNum { get; set; }
        public int? LineNum { get; set; }
    }
}
