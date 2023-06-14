using Abp.Dependency;
using GraphQL.Types;
using GraphQL.Utilities;
using tmss.Queries.Container;
using System;

namespace tmss.Schemas
{
    public class MainSchema : Schema, ITransientDependency
    {
        public MainSchema(IServiceProvider provider) :
            base(provider)
        {
            Query = provider.GetRequiredService<QueryContainer>();
        }
    }
}