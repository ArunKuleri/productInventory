using Microsoft.EntityFrameworkCore;
using ProductInventory.Properties.Models;

namespace ProductInventory.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Variant> Variants { get; set; }
        public DbSet<VariantOption> VariantOptions { get; set; }
        public DbSet<StockTransaction> StockTransaction { get; set; }

        // Add other DbSets for your models here
    }
}