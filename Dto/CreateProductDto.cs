namespace ProductInventory.Dto
{
    public class CreateProductDto
    {
        public string ProductCode { get; set; }
        public string ProductName { get; set; }
        public string ProductImage { get; set; }
        public Guid CreatedUser { get; set; }
        public string HSNCode { get; set; }

        public List<VarientDto> Variants { get; set; }

    }
}
