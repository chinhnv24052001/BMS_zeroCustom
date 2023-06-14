using Xamarin.Forms;

namespace tmss.Views
{
    public partial class MainView : FlyoutPage, IXamarinView
    {
        public MainView()
        {
            InitializeComponent();
            NavigationPage.SetHasNavigationBar(this, false);
        }
    }
}
