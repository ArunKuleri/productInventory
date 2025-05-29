using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace ProductInventory.Properties.Models
{
    public class Variant
    {
        public int Id { get; set; }
        public Guid ProductId { get; set; }
        public string Name { get; set; }

        [ForeignKey("ProductId")]
        [JsonIgnore]
        public Product Product { get; set; }
        public ICollection<VariantOption> Options { get; set; }


    }
}