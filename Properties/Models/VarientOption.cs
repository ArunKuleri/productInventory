using System.ComponentModel.DataAnnotations.Schema;

namespace ProductInventory.Properties.Models
{
    public class VariantOption
    {
        public int Id { get; set; }
        public int VariantId { get; set; }
        public string OptionValue { get; set; }

        [ForeignKey("VariantId")]
        public Variant Variant { get; set; }
    }
}