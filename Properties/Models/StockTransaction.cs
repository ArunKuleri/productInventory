using System.ComponentModel.DataAnnotations.Schema;

namespace ProductInventory.Properties.Models
{
    public class StockTransaction
    {
        public int Id { get; set; }
        public Guid ProductId { get; set; }
        public string VariantCombination { get; set; }
        public decimal Quantity { get; set; }
        public DateTimeOffset TransactionDate { get; set; }
        public string Type { get; set; } 

        [ForeignKey("ProductId")]
        public Product product { get; set; }
    }
}
