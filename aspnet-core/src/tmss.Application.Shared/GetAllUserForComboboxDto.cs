using Abp.Application.Services.Dto;

namespace tmss
{
    public class GetAllUserForComboboxDto : EntityDto<long>
    {
        public string UserNameAndEmail { get; set; }
    }
}
