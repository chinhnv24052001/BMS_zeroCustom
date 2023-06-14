namespace tmss.RequestApproval.Dto
{
    public class ForwardInputDto
    {
        public ForwardInputDto()
        {
            NumberPersonToFw = 1;
        }
        public long RequestApprovalStepId { get; set; }
        public long ForwardUserId { get; set; }
        public long NumberPersonToFw { get; set; }
        public string Note { get; set; }
    }
}
