namespace ProductInventory.Dto
{
    public class StockDto
    {
        public Guid ProductId { get; set; }
        public string VariantCombination { get; set; }
        public decimal Quantity { get; set; }
    }
}
