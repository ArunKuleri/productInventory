namespace ProductInventory.Properties.Models
{
    public class Product
    {
        public Guid id {  get; set; }
        public string productCode { get; set; }
        public string productName { get; set; }
        public string productImage { get; set; }
        public DateTimeOffset CreateDate { get; set; }
        public DateTimeOffset UpdateDate { get; set; }
        public Guid CreatedUser { get; set; }
        public bool IsFavorate { get; set; }
        public bool Active {  get; set; }
        public string HSNCODE {  get; set; }
        public string? decimalStock { get; set; }
        public decimal TotalStock { get; set; }
        public ICollection<Variant> Variants { get; set; }
    }
}
